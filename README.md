# node-smbopenr
Provide an fd for a given smb path

A path should be provided in the form '//server/share/…'. No provision is made
for anything other than guest access. Win32 systems will open the path directly,
unix platforms need smbget installed which will be used to copy the remote file
into a local tmp file.

```js
const smbopenr = require('smbopenr')
smbopenr('//server/share/path', (err, fd)=>{
	// Do all your favourite fd things here.
	// Unless you want to do something other than read.
	// This is only for reading.
})
