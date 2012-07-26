#coding: utf-8
# L'objectif de ce script python est de modifier le code source de Erajs pour ajouter de manière automatique
# Une dépendance a RequireJS
# Il s'agit en gros de parser tous les fichiers js du projet, de leur rajouter une appel un define en début de fichier et
# une fermeture de fonction en fin de fichier. Essaie aussi de parser le fichier pour voir s'il n'y a pas des références à
# d'autre module et donc rajouter dans le define un appel vers ceux-là...
# Rajoute aussi de manière automatique les main.js de chaque package et rajoute la clause return d'un module là où il faut
# Il faut aussi supprimer toutes les références vers Core. ou Ui. et les remplacer par rien sauf dans le cas où l'on est pas
# dans le même package ou que ce qui vient après le Core. ou Ui. est définit à l'intérieur même du fichier ou sauf si la ligne est
# dans un commentaire (// ou /* ou *) ou à l'intérieur d'une string (extend)
# Attention aussi a bien mettre Object de Core.Object en minuscule
import os

packages = ["core", "ui", "form", "anim"]

def is_module_define(content):
	return content[0:6] == 'define'

def get_module_class_names(content):
	class_names = []
	start = 0
	index = content.find('.extend(', start)
	while index != -1:
		quote_type = content[index+8]
		class_start = index+9
		class_end = content.find(quote_type, class_start)
		class_names.append(content[class_start:class_end])
		start = class_end
		index = content.find('.extend(', start)
	return class_names

def get_external_packages(content):
	package_used = []
	for name in packages:
		if name != package_name and content.find(name.capitalize() + '.') != -1:
			package_used.append(name)
	return package_used

def is_line_comment(line):
	sline = line.lstrip()
	return (len(sline) > 0 and sline[0] == '*') or (len(sline) > 1 and (sline[0:2] == '//' or sline[0:2] == '/*'))

# On cherche toutes les références aux modules contenus dans les packages utilisés
# Donc tout ce qui commence par Package. et finit par un "." (appel de fonction ou de propriété), un " " ou "(" (appel de constructeur)
# Puis on enlève le nom du package pour ne laisser que la classe le namespace du module
# Rajoute une tabulation sur toutes les lignes
# return : la ligne modifiée + un tableau contenant les defines à rajouter
def remove_module_references(line, package_name_list, internal_class_names):
	# clé : nom requirejs du module (ie ui/color), valeur : nom du namespace (ie Color)
	define_map = {}
	# Tout d'abord on rajoute une tabulation à toutes les lignes
	new_line = '\t' + line
	for package in package_name_list:
		token_list = [' ','"', "'", ';', '(', ')', '[', ']', '.', ',', '\n', '#', '!']
		start = 0
		package_dot = package.capitalize() + '.'
		index = line.find(package_dot, start)
		while index != -1 and line[index-1] in token_list:
			module_start = index + len(package_dot)
			module_end = -1
			for token in token_list:
				pos = line.find(token, module_start)
				if pos != -1 and (module_end == -1 or pos < module_end):
					module_end = pos
			if module_end != -1:
				module_namespace = line[module_start:module_end]
				full_name = package_dot + module_namespace
				# Attention à ne pas rajouter des classes définit dans le fichier
				if not(full_name in internal_class_names): 
					if module_namespace == 'Object':
						module_namespace = 'object'
					module_key = package + '/' + module_namespace.lower()
					define_map[module_key] = [module_namespace, full_name]
 			else:
				print('Gros probleme ligne=' + line)
				break
			start = module_end
			index = line.find(package_dot, start)

	for key in define_map:
		namespace = define_map[key]
		new_line = new_line.replace(namespace[1], namespace[0])
	return new_line, define_map

# Génère la première ligne de define d'un fichier
def get_define_line(define_list):
	line = "define(["
	first = True
	for module in define_list:
		if first:
			if len(define_list) > 1:
				line = line + "'" + module + "' "
			else:
				line = line + "'" + module + "'"
			first = False
		else:
			line = line + ", '" + module + "'"
	line = line + "], "
	# S'il y a trop de modules on met sur 2 lignes
	if len(define_list) > 4:
		line = line + '\n'
	line = line + "function("
	first = True
	for module in define_list:
		namespace_pair = define_list[module]
		namespace = namespace_pair[0]
		if first:
			if len(define_list) > 1:
				line = line + namespace + " "
			else:
				line = line + namespace
			first = False
		else:
			line = line + ", " + namespace
	line = line + "){\n"

	return line

# Ajoute tout le code nécessaire à un fichier js pour le transformer en module Requirejs
def define_module(directory, package_name, name, export_dir):
	#Liste de tous les packages utilisés dans ce module
	package_name_list = [package_name]

	f = open(os.path.join(directory, name))
	content = f.read()
	f.close()
	# On cherche les noms de classe
	class_names = get_module_class_names(content)
	if not(is_module_define(content)):
		# Gestion du cas particulier object et util
		if len(class_names) == 0 and name in ['object.js', 'util.js']:
			class_names.append('Core.' + name.split('.')[0].capitalize())
		if len(class_names) > 1:
			pass#print("Plusieurs classes définies dans " + name + " il faudra définir à la main où mettre le return dans le code.")
		# On cherche aussi si des packages exterieurs sont utilisés
		package_name_list = package_name_list + get_external_packages(content)
		if len(package_name_list) > 1:
			pass#print(name + " utilise " + str(package_name_list))

		define_list = {}
		new_content = []
		f = open(os.path.join(directory, name))
		for line in f.readlines():
			# Si la ligne est un commentaire, on ne fait rien
			if not(is_line_comment(line)):
				new_line, modules_path = remove_module_references(line, package_name_list, class_names)
				new_content.append(new_line)
				define_list = dict(define_list.items() + modules_path.items())
			else:
				# On rajoute une tabulation à chaque ligne
				new_content.append('\t' + line)
		f.close()
		# On rajoute à notre nouveau fichier les en-tête de define
		new_content.insert(0, get_define_line(define_list))
		# On met le return de la première classe à la fin 
		# (comme ça on laisse s'executer le code en dehors de la définition de classe)
		if len(class_names) > 0:
			new_content.append('\treturn ' + class_names[0] + ';')
		# Et la fermeture de fonction tout a la fin
		new_content.append('\n\n});')
		
		# et enfin on écrit un nouveau fichier
		final_path = os.path.join(export_dir, package_name)
		if not(os.path.exists(final_path)):
			os.mkdir(final_path)
		new_file = open(os.path.join(final_path, name), 'w')
		for line in new_content:
			new_file.write(line)
		new_file.close()
	else:
		print("Module " + name + " already defined")
		final_path = os.path.join(export_dir, package_name)
		if not(os.path.exists(final_path)):
			os.mkdir(final_path)
		new_file = open(os.path.join(final_path, name), 'w')
		new_file.write(content)
		new_file.close()
	if len(class_names) > 0:
		return class_names[0].split('.')[1]
	else:
		return None

# Pour pouvoir faire un require sur un package entier, il nous faut un main.js
# qui lui require tous les modules du package à notre place
def create_package_main(package_name, module_names, export_dir):
	final_path = os.path.join(export_dir, package_name)
	if not(os.path.exists(final_path)):
		os.mkdir(final_path)
	main_file = open(os.path.join(final_path, 'main.js'), 'w')

	define_map = {}
	for name in module_names:
		namespace = name
		if namespace == 'switch':
			namespace = namespace.capitalize()
		define_map[package_name + '/' + name] = [namespace]
	 
	define_line = get_define_line(define_map)

	main_file.write(define_line)
	# On renvoit un objet json avec les noms en format Hungarian en clé et les namespace de module en valeur
	main_file.write('\treturn {\n')
	first = True
	for name in module_names:
		if not(first):
			main_file.write(',\n')
		first = False
		namespace = name
		if namespace == 'switch':
			namespace = namespace.capitalize()
		# Ca doit être hungarian normalement
		class_name = module_names[name]
		if not(class_name):
			class_name = namespace.capitalize()
		main_file.write('\t\t"' + class_name + '": ' + namespace)
	main_file.write('\n\t};\n')
	main_file.write('});')

# Dossier où vont se trouver les fichiers générés
dir_name = 'era_require'
if not(os.path.exists(dir_name)):
	os.mkdir(dir_name)

print("Parsing all erajs files and generate requirejs compatible code")
# Tout d'abord parsons tous les fichiers .js contenus dans le dossier era
for directory, dirnames, filenames in os.walk('era'):
	# S'il n'y pas de répertoire enfant, on est dans un package
	if len(dirnames) == 0:
		package_name = os.path.basename(directory)
		module_name_map = {}
		for name in filenames:
			module_name = os.path.splitext(name)[0].lower()
			class_name = define_module(directory, package_name, name, dir_name)
			module_name_map[module_name] = class_name
		if len(module_name_map) > 0:
			create_package_main(package_name, module_name_map, dir_name)
print("All files generated at era_require")

		#print(dirnames)
		#print(module_names)
	# On fait par dossier "package"
	# Ensuite regardons s'ils n'ont pas de define au début
	# On peut rajouter un define et on regarde combien il y a de extend dans le module