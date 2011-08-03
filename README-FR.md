# Description

Era est un framework JavaScript développé par Daniel Lacroix au sein
du service Erasme (www.erasme.org) du département du Rhône.

Ses principals caractéristiques sont :

- Le développement d'application se fait exclusivement en
  JavaScript. Pas d'html, de CSS ou autre.
- Pensé pour les appareils multi-touch (iPad, Android). Toute
  application développée avec Era une ergonomie compatible avec ces
  appareils.
- Utilisation massive des nouvelles propriétés des navigateurs
  (Drag&Drop, audio, vidéo, animation).
- Un fonctionnement identique d'un navigateur à l'autre. Ex : Gradient
  et bord arrondis même sous IE 8, système d'évènement recoder pour
  être générique.
- Une compatibilité assurée pour Firefox 3.6+, Chrome 6+, Safari 5+,
  IE8+ et Opera 10+. Ainsi que pour iOs 4+ et Android 2.2+
- Un système de layout avancé similaire à GTK ou autre framework natif
- Une gestion du redimensionnement
- Un système d'animation haut de gamme
- Des composants réutilisable et stylables sans passer par CSS

# Sources du projet

> git clone git@forge.erasme.org:era

Commande pour générer la doc :

> $ export JSDOCDIR=<path_to_jsdoc-toolkit> 
> $ cd <path-to-era-repo>
> $ java -jar $JSDOCDIR/jsrun.jar $JSDOCDIR/app/run.js -c=doc/jsdoc/conf/era.conf

# Licence

Copyright (c) Departement du Rhone Erasme <support@erasme.org>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

The Software is provided "as is", without warranty of any kind,
express or implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and
noninfringement. In no event shall the authors or copyright holders be
liable for any claim, damages or other liability, whether in an action
of contract, tort or otherwise, arising from, out of or in connection
with the software or the use or other dealings in the Software.


