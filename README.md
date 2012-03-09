# ERAjs : The JavaScript application library for applications developpers

ERAjs is a JavaScript Application Library which main target is to act like native application toolkit and is build the ground up with multi devices ergonomy in mind.

ERAjs keyfeatures are :

- JavaScript exclusivity : ERAjs does not relly on a HTML tructure neither on CSS for styling. It's only pure JavaScript which induce a little performance overhead but decuplate possibilities !
- Advanced layout : Since it does not relly on HTML ERAjs offers advanced layout functionnality similar to a native toolkit (GTK+, Qt...). Such features are VBox, HBox, Grid, Flow etc.
- Responsive design : An ERAjs app automatically resize it self to fit the screen, an depending on the layout, elements can reorganize themself to avoid horizontal scrolling. And hence it's pure JS, you can easilly write specific behavior on resize.
- Widget based system : ERAjs allows you to manipulate highlevel widgets and style them as you like. Widget can be combine together to form more highlevel components.
- Same experience everywhere : ERAjs garanties that your application will look and behave the same regardless your browser or your device without any modification. Multitouch device (smart phones, tablets), keyboard only navigation (for accessibility), multitouch screens (with a built-in virtual keyborad !) and of course classical desktop browsing.

# Project's sources

    git clone git@forge.erasme.org:era

# Hello World application

    
# Containers

Containers are at the heart of ERAjs, they allow you to build quite easily very complex widgets by just stack functionnality into one widgets.

As you may have guess, containers contains elements. They can contain other containers (ie a VBox in a HBox) or "final elements" (ie Buttons).

All of them (except Fixed) adapt themself to the screen size and try to fit elements until they've reach their minimum size.

We can devide containers in 3 types : layout containers, behaviour containers and high level containers.

## Layout containers

Layout containers allow you to arrange your application layout dynamically.


### VBox & HBox

Probably the most used containers, they allow you to stack elements, either vertically or horizontally. VBox and HBox inherite from Box, they just differ in their orientation.


### LBox

### Grid

### Fixed

### Flow

### Embed

## Behaviour containers

### ScrollingArea

### TransitionBox

### Fold

### Carouselable

### Pressable

### Selectable

### Dropable

### Dragable

### Linkable

### Uploadable

### Mouseoverable

### Movable

### Togglable

### Transformable (touch devices only)

### Accordeonable

## Visual containers

### Notebook

### Popup

### Toolbar

# Visual Elements

## Buttons

### Button

### Download Button

### Link Button

### ToggleButton

### UploadButton

## Checkbox

## Combo

## Label

## Compactlabel

## Carousel

## Audio

## Video

## Datepicker

## Icon

## Image

## Loading

## Progressbar

## Rectangle

## Separator

## Shape

## Slider

## Shadow

## Switch

## Text

## TextAreaField

## TextField

## TextButtonField

## SegmentBar

# High-level components

## ListView

## Locator

## VirtualKeyboard

## Menu

## Form

### Field

### Panel

### Popup

# Understand alignement (center, etc.)

# Animations

# Object Model

# Events

# Making your own widget

# Styling

# Client/Server interaction

# Websockets

# Generate API documentation

You can generate the documentation using JSDoc :

    $ export JSDOCDIR=<path_to_jsdoc-toolkit> 
    $ cd <path-to-era-repo>
    $ java -jar $JSDOCDIR/jsrun.jar $JSDOCDIR/app/run.js -c=doc/jsdoc/conf/era.conf


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


