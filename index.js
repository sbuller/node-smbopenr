const fs = require('fs')
const {spawn} = require('child_process') 
const tmp = require('tmp')

module.exports = smbopenr

// open a path of form '//server/share/…'
// win32 should be able to open directly - at least when path separators are changed
// unix platforms must smbget the file to a temporary directory
function smbopenr(path, cb) {
	if (process.platform === 'win32') {
		fs.open(winPath(path), 'r', cb)
	} else {
		getAndOpen(path, cb)
	}
}

function winPath(path) {
	return path.replace('/', '\\')
}

function getAndOpen(path, cb) {
	if (!pathIsClean(path)) return cb(new Error("I don't trust this path: " + path))

	tmp.setGracefulCleanup()
	tmp.file((err, tmpPath, fd, cleanup)=>{
		if (err) return cb(err)

		let local = fs.createWriteStream(null, {fd})
		// ensure path looks sane before this point
		let smbget = spawn('smbget', ['-O', '-a', "smb:" + path])

		smbget.stdout.pipe(local)

		smbget.on('error', err=>cb(new Error("Couldn't execute smbget", err)))
		smbget.on('exit', code=>code?
			cb(new Error("Exit code from smbget", code)):
			fs.open(tmpPath, 'r', cb)
		)
	})
}

function pathIsClean(path) {
	let match = path.match('^//[a-zA-Z0-9-]+(/[a-zA-Z0-9`~!@#$%^&(){}\'._-]+([ ]+[a-zA-Z0-9`~!@#$%^&(){}\'._-]+)*)+$')
	return !!match
}
