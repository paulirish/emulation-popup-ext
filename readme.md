device emulation chrome extension
===================

Click the little cute icon and you get a popup window with the same page, but now under Chrome DevTools device emulation. Emulating the UA, DPR, screen, and viewport settings. (No touch events yet, but they are trivial to add)

We're using chrome devtools' built-in device emulation via the extension API.

If you've been wanting to use this emulation stuff via an extension or continuous integration setup, then you probably are interested in [how to use emulation via the debugging protocol](https://github.com/paulirish/emulation-popup-ext/blob/master/app/scripts/background.js#L32)

![image](https://cloud.githubusercontent.com/assets/39191/4368873/02620452-42f4-11e4-9a55-bd332c81185a.png)

