# gist-wikis
Store TiddlyWiki tiddlers in a GitHub Gist

# TiddlyWiki stored in a GitHub Gist
A GitHub Gist can be used to store a Node.js TiddlyWiki. The Gist can be `git clone` into the 'tiddlers' sub-directory of the Node.js TiddlyWiki. Changes to the wiki can be stored on GitHub by up-streaming changes to the GitHub Gist `git push`.

These directions assume you have [Git](https://git-scm.com/downloads), [Install TiddlyWiki on Node.js](https://tiddlywiki.com/static/Installing%2520TiddlyWiki%2520on%2520Node.js.html) and a [GitHub account](https://github.com/signup?source=login). It is also assumed that Git and GitHub are already configured for GitHub user authentication. See [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh); which is a start - may the authentication Gods smile upon you.

There are two node scripts `./twgist.js` to help in creating a TiddlyWiki populated with tiddlers from a Gist; and `./twpush.js` that upstreams wiki changes to the Gist.

## Install the scripts

```
git clone https://github.com/PotOfCoffee2Go/gist-wikis.git
cd gist-wikis
```

I will be using `my-wiki` as the directory name of a wiki as an example.

> Do not use spaces in the directory name as different platforms/shells (Windows/Linux/MacOS) handle the spaces differently. No platform issues as long is a valid directory name without spaces. Use underbar or dashes instead.

## Create a Gist

The Gist-ID is used to pull the tiddlers from the gist into the TiddlyWiki's `tiddlers` sub-directory. This is done when the wiki is created. Will need to create a Gist first in order to get a Gist-ID.

> See [Creating a gist](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists#creating-a-gist) if you have not created a GitHub Gist before.

Go to [GitHub Gists](https://gist.github.com/mine) and press the top-right '+' sign to create a Gist.

A filename is required to create a Gist - use `#my-wiki.tid`. The hash '#' at the beginning will place this file as the first file in the Gist (files are in alphabetical order) which will also be the name of the Gist on GitHub.

The content of the `#my-wiki.tid` file contains at least the title of the tiddler, but can be any tiddler in `.tid` format.

```
title: #my-wiki
```

Save the Gist as public or secret - your choice.

> "Secret gists aren't private. If you send the URL of a secret gist to a friend, they'll be able to see it. However, if someone you don't know discovers the URL, they'll also be able to see your gist."
>> [GitHub Docs](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists)

## Gist Id
Once saved, the path of the gist will end in a long number displayed in the browser address bar. Copy that number - it is the 'Gist Id' which is needed to create your wiki. Once created you will no longer need the Id unless re-creating or creating/copying on another machine. 

## Create a 'server' edition wiki
From the `gist-wikis` directory:

```
node ./twgist my-wiki {paste-gist-id-here}
```

So will look like:
```
node ./twgist my-wiki 0ff830fa237ff39b7de3942536cb08ab
```
but with your Gist-Id instead.

The console will display the commands and results that are used to create and populate the wiki with tiddlers.

## Start TiddlyWiki WebServer
```
tiddlywiki my-wiki --listen
```

## Update the wiki
Go to `http://localhost:8080` and update the wiki - add tiddlers, plugins, settings, as usual. Is handy to make a tiddler with a link to the GitHub Gist.

## Store changes to Gist
Go back to the terminal window and `cntl-c` to stop the WebServer
```
node ./twpush my-wiki "optional commit message"
```
Commands and results are displayed that pushed tiddlers to the gist.

Restart the WebServer:
```
tiddlywiki my-wiki --listen
```

> By opening two terminal windows can run the WebServer in one of them and do the `node ./twpush` command from the other. There is no need to stop the WebServer.

You can create as many wikis/gists as you wish.
