---
title: "Managing environment variables on Node.js"
date: 2015-02-03
---

So you have that newly API key set up, that you want to incorporate into your Node.js app, you don't want to hard code it directly into you  application code, because you want to share it later to the world and you don't want everyone using your API key (substitute API key by any sensitive data), and you are right, lately there were some [bots](http://www.devfactor.net/2014/12/30/2375-amazon-mistake/) crawling GitHub looking for EC2 secret keys on public projects, so they can spawn EC2 servers to mine Bitcoin, so you might have to be more cautious about what you push to GitHub.

### Environment variables
One approach to solve this problem, is storing that API key as an environment variable on your system, those are accessible in NodeJS  in the object `process.env`, you'll find things like your username, localization stuff (go ahead and try it), but how to add them? if you are on Linux (as you should be :smile:), you simply want to add this line to your `.bashrc` or `.zshrc`.

```sh
export VARIABLE_NAME=VARIABLE_CONTENT
```

This will do the trick (to be run on your terminal):

```sh
$ echo export API_KEY=AWESOME_API_KEY >> .bashrc
$ source .bashrc
```

The first line writes the variable at the end of `.bashrc` and the second one tells the terminal to reload `.bashrc` file (this is usually done you when launch terminal the first time)
now you cant access that variable:

```js
console.log(process.env.API_KEY);
// ==> AWESOME_API_KEY
```

But that's really tedious to do, and you end up with a really big `.bashrc` file filled with dusty API keys you used a long time ago. What if we could store in a separate file in your project directory that we can just load at the start of the app?

### dotenv to the rescue
[dotenv](https://github.com/motdotla/dotenv) is a really cool package that allows us to do just that. Here is how it works: you store your environment variables in file called `.env` just like we used to do before, then you load that file into your app and you have all your variables available under the object `process.env` just like we used to have when stored them on `.bashrc`. The cool thing is that now you have a separate file per each project which makes it easier to deploy your app or change some variable later.

In the root of your project create a file `.env`, and don't remember to add it to `.gitignore` so we don't push it by mistake to a public repo:

```sh
$ touch .env
$ echo .env >> .gitignore
```

Install the package:

```sh
$ npm install --save dotenv
```
Add content to `.env`

```
AWESOME_VARIABLE=I'M AWESOME
FANTASTIC_VARIABLE=I'M FANTASTIC
```

and to use it, add this to the beginning of your app script:

```js
var dotenv = require('dotenv');
dotenv.load();
```

Now all you variables are available under `process.env`.

Happy coding! :)
