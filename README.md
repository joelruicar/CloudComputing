<img src="file:///E:/1.%20MAESTRIA%209122023/4.%20Cloud%20Computing/Faas.png" align="right" height="124px" />


# Claud  Computing
Here are a few tips to get you started:

* To create a **New Document** press **Ctrl-N** or **click @icon-plus-circle** on the toolbar

* To toggle the **HTML Preview** press **F12** or click @icon-globe in the Window bar

* To toggle the **Folder Browser Sidebar** press **Ctrl-Shift-B** or click **@icon-bars**

* The **@icon-bars SideBar** also holds **Favorites** and **Markdown Document Outline**

* To change **UI Themes**, click on the dropdown lists on the bottom right status bar:

![Image and Preview Themes on the toolbar](https://markdownmonster.west-wind.com/docs/images/EditorPreviewThemeUi.png) 
  
* For **** look at `visualstudio`, `github` or `xcode`  

![look][]
* For **dark editor themes** look at `vscodedark`, `twilight`, `monokai`, `terminal`

### Problems? Please let us know

If you run into any problems or issues, **please** let us know so we can address and fix them right away. You can report issues on GitHub:

* [Markdown Monster Bug Reports and Feature Requests](https://github.com/RickStrahl/MarkdownMonster/issues)

# Markdown Features
This topic is meant to give you a very basic overview of how Markdown works, showing some of the most frequently used operations.

### Bold and Italic
This text **is bold**.  
This text *is italic*.  
This text ~~is struck out~~.

### Header Text
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6


### Line Continuation
By default Markdown **adds paragraphs at double line breaks**. Single line breaks by themselves are simply wrapped together into a single line. If you want to have **soft returns** that break a single line, add **two spaces at the end of the line** <small>(shift-enter)</small> or use a backslash `\`.

---

This line has a paragraph break at the end (empty line after).

Theses two lines should display as a single
line because there's no double space at the end.

The following line has a soft break at the end (two spaces or a `\` at end)  
This line should be following on the very next line.  

You can also use `shift-enter` to inject the two spaces plus linefeed at the end of a line.  
To show all white space and returns in a document you can use **View -> Toggle Invisible Characters**.

---

### Links
You can easily link using `[text](link)` syntax:

[Markdown Monster Web Site](http://MarkdownMonster.west-wind.com/)

If you need additional image tags like targets or title attributes you can also embed HTML directly using raw HTML markup:

```html
Go to the 
<a href="https://markdownmonster.west-wind.com" style="font-style: italic">
    Markdown Monster Web Site
</a>
```

renders:

Go to the
<a href="https://markdownmonster.west-wind.com" style="font-style: italic">
    Markdown Monster Web Site
</a>

---

### Images
Images are similar to links:

```markdown
![Markdown Monster](https://markdownmonster.west-wind.com/Images/MarkdownMonster_Icon_128.png)
```

which renders:

![Markdown Monster](https://markdownmonster.west-wind.com/Images/MarkdownMonster_Icon_128.png)

You can embed images from the Clipboard by pasting (**ctrl-v**), by using the @icon-image Image Dialog, or by dragging and dropping images into the document from the Folder Browser, Windows Explorer or a

### Block Quotes
Block quotes are callouts that are great for adding notes or warnings into documentation.

Simple block quotes simply use a `>` to start a quote block:

```markdown
> **Note:** Block quotes can be used to highlight important ideas.
```

This renders to:

> **Note:** Block quotes can be used to highlight important ideas.

You can make quote blocks look nicer with headers and icons (using FontAwesome here):

```markdown
> ### @ icon-info-circle Headers break on their own
> Note that headers don't need line continuation characters 
> as they are block elements and automatically break. Only text lines
> require the double spaces for single line breaks.
```
Note that lines automatically wrap in the quote block, if no newline with `>' is provided. Shown with the breaks here to make it easier to read. The following uses a single line for the second block which renders identically:

> ### @icon-info-circle Headers break on their own
> Note that headers don't need line continuation characters as they are block elements and automatically break. Only text lines require the double spaces for single line breaks.


### Fontawesome Icons
Markdown Monster includes custom syntax for FontAwesome icons in its templates. You can embed a `@ icon-` followed by a font-awesome icon name to automatically embed that icon without full HTML syntax.

```markdown
@ icon-gear Configuration
```

which renders:

---

@icon-gear Configuration

---

Note that this renders the following html:

```html
<i class="fa fa-gear"></i>
```

### Emojis
You can also embed Emojis into your markdown using the Emoji dialog or common 

```markdown
:smile: :rage: :sweat: :point_down:

:-) :-( :-/ 
````

This renders:

---

:smile: :rage: :sweat: :point_down:

:-) :-( :-/ 

---

### HTML Markup
You can also embed plain HTML markup into the page if you like. For example, if you want full control over fontawesome icons you can use this:

This text can be **embedded** into Markdown:  

```markdown
<i class="fa fa-refresh fa-spin fa-2x"></i> &nbsp;**Refresh Page**
```

<i class="fa fa-refresh fa-spin fa-2x"></i> &nbsp;**Refresh Page**

Note that blocks of raw HTML markup should be separated from text by empty lines above and below the HTML blocks.


### Comment Blocks - Keep Markdown from Rendering
Markdown has support for HTML comments and you can use `<!--` for the beginning and `-->` for the end of a block of markdown that you don't want to render.

```markdown
### Commenting
This text and header renders fine.

<!-- 
This paragraph is commented out and **does not render**.
-->

This footer is comming across just fine.
```

This renders:

--- 
### Commenting
This text and header renders fine.

<!-- 
This paragraph is commented out and **does not render**.
-->

This footer is coming across just fine.

---


### Unordered Lists

```markdown
* Item 1
* Item 2
* Item 3  
```

This renders:

---

* Item 1
* Item 2
* Item 3  

---


This text is part of the third item. Use a soft return (`shift-enter` or two spaces or `\`) at the end of the the list item to break the line and continue at the bullet indentation.

A double line break, breaks out of the list.

### Ordered Lists
Ordered lists use number like `1.` or `2.` for the bullet items. 

```markdown
1. **Item 1**  
Item 1 is really something
2. **Item 2**  
Item two is really something else
```

renders to:

1. **Item 1**  
Item 1 is really something
2. **Item 2**  
Item two is really something else


If you want lines to break (like after the bold headers) you cna use **soft returns**.

> **Note**: Numbered lists **order themselves based on order** rather than the number you explicitly use. If you frequently reorder lists it's useful to number all items `1.`.

You can also nest lists and mix ordered and unordered lists:

```markdown
1. First, get these ingredients:

      * carrots
      * celery
      * lentils

2. Boil some water.

3. Dump everything in the pot and follow  
this algorithm:
```

This renders:

---

1. First, get these ingredients:

      * carrots
      * celery
      * lentils

 2. Boil some water.

 3. Dump everything in the pot and follow  
    this algorithm:

---

### Inline Code
If you want to embed code in the middle of a paragraph of text to highlight a coding syntax or class/member name you can use inline code syntax:

```markdown
Inline code or member references  like `SomeMethod()` can be codified...
```
---

Inline code or member references  like `SomeMethod()` can be codified... You can use the `'{}'` menu or **Ctrl-\`** to embed inline code.

---

### Indented Code Blocks 
Markdown supports code blocks syntax in a couple of ways:

Using an indented text block for code:


````markdown
Some rendered text...

    // This is code by way of four leading spaces
    // or a leading tab
    int x = 0;
    string text = null;
    for(int i; i < 10; i++;) {
        text += text + "Line " + i;
    }

More text here
````

renders:

---

Some rendered text...

    // This is code by way of four leading spaces
    // or a leading tab
    int x = 0;
    string text = null;
    for(int i; i < 10; i++;) {
        text += text + "Line " + i;
    }

More text here

---

### Fenced Code Blocks with Syntax Highlighting
You can also use triple back ticks plus an optional coding language to support for syntax highlighting.

The following is C# code.

````markdown
```csharp
// this code will be syntax highlighted
for(var i=0; i++; i < 10)
{
    Console.WriteLine(i);
}
```  
````

which renders syntax colored code:

```csharp
// this code will be syntax highlighted
for(var i=0; i++; i < 10)
{
    Console.WriteLine(i);
}
```    

Many languages are supported: html, xml, javascript, typescript, css, csharp, fsharp foxpro, vbnet, sql, python, ruby, php, powershell, dos, markdown, yaml and many more. Use the Code drop down list to get a list of available languages.

You can also leave out the language to attempt auto-detection or use `text` for plain text:

````markdown
```text
robocopy c:\temp\test d:\temp\test
```
````

renders plain, but formatted text:

```text
robocopy c:\temp\test d:\temp\test
```

> **Note**: Prefer using `text` for non-highlighted syntax over no syntax as no syntax tries to auto-discover the syntax which often is not correct. Always be specific with syntax specified.

### Footnotes
Footnotes can be embedded like this:

Here is some text that includes a Footnote [^1] in the middle of its text. And here's another footnote [^2]. The actual footnotes render on the very bottom of the page.

[^1]: Source: [Markdown Monster Web Site](http://markdownmonster.west-wind.com)
[^2]: Source: [Markdown Monster Web Site](http://markdownmonster.west-wind.com)

### Pipe Tables
[Pipe Tables](https://github.com/lunet-io/markdig/blob/master/src/Markdig.Tests/Specs/PipeTableSpecs.md) can be used to create simple single line tables:


```markdown
|size | material     | color       |
|---- | ------------ | ------------|
|9    | leather      | brown **fox**  |
|10   | hemp canvas  | natural |
|11   | glass        | transparent |
```

---

|size | material     | color       |
|---- | ------------ | ------------|
|9    | leather      | brown **fox**  |
|10   | hemp canvas  | natural |
|11   | glass        | transparent |

> **Note:** Cell lines don't have to line up to render properly. Max columns in any row determines table columns for the entire table. Pipe tables also don't need leading and trailing pipes to render as tables, but make sure you check compatibility with your final rendering site.

### Grid Tables
[Grid Tables](https://github.com/lunet-io/markdig/blob/master/src/Markdig.Tests/Specs/GridTableSpecs.md) are a bit more flexible than Pipe Tables in that they can have multiple lines of text per cell and handle multi-line embedded Markdown text.

```markdown
+---------+---------+
| Header  | Header  |
| Column1 | Column2 |
+=========+=========+
| 1. ab   | > This is a quote
| 2. cde  | > For the second column 
| 3. f    |
+---------+---------+
| Second row spanning
| on two columns
+---------+---------+
| Back    |         |
| to      |         |
| one     |         |
| column  |         | 
```

--- 
+---------+---------+
| Header  | Header  |
| Column1 | Column2 |
+=========+=========+
| 1. ab   | > This is a quote
| 2. cde  | > For the second column 
| 3. f    |
+---------+---------+
| Second row spanning
| on two columns
+---------+---------+
| Back    |         |
| to      |         |
| one     |         |
| column  |         | 


> ### @icon-info-circle Use the @icon-table Table Editor 
> For easier table data entry and pretty rendered tables you can use the table editor which provides grid based table data entry. You can use the table editor with **Pipe**, **Grid** and **HTML** tables.

### DocFx Extensions
Markdown Monster supports some DocFx extensions if you enable the `ParseDocFx` option in the settings.

#### Blockquote Formatters
There's support for the following block quote formatters:

> [!NOTE]
> This is a note

> [!IMPORTANT]
>This is important

> [!CAUTION]
>This is important

> [!WARNING]
>This is important

#### File Includes
You can embed another Markdown file into the current document via an `!Include`:

```md
[!include[Included Test File](test1.md)]
```
---

[!include[Included Test File](./test.md)]

---



[image_ref_kiapb8g8]: data:image/png;base64,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
[!code-csharp[](~/program.cs)]