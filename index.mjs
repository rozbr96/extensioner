
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'


const KNOWN_EXTENSIONS = [
  'pdf', 'jpeg', 'png', 'gif', 'json', 'riff'
]

const KNOWN_FILE_TYPES = {
  'Microsoft Word 2007+': 'docx',
  'Microsoft Excel 2007+': 'xlsx',
  'ASCII text': 'csv'
}

const copy = (src, dst) => {
  const dstDir = path.dirname(dst)

  fs.mkdirSync(dstDir, { recursive: true })

  fs.cpSync(src, dst)
}


const handleDir = (dirPath, dir) => {
  const nextDirPath = path.join(dirPath, dir.name)

  opendir(nextDirPath)
}


const handleFile = (dirPath, file) => {
  const filePath = path.join(dirPath, file.name)
  const command = `file -b "${filePath}"`
  const commandOutput = execSync(command).toString().trim()
  const dstFolderPath = dirPath.replace('input/', 'output/')

  if (commandOutput.includes('empty')) {
    copy(filePath, path.join(dstFolderPath, file.name))
  } else {
    let fileExtension = null
    const extension = commandOutput.split(' ').shift().toLowerCase()
    const fileType = commandOutput.split(',').shift()

    if (KNOWN_EXTENSIONS.includes(extension)) {
      fileExtension = extension
    } else if (Object.keys(KNOWN_FILE_TYPES).includes(fileType)) {
      fileExtension = KNOWN_FILE_TYPES[fileType]
    } else {
      console.log(commandOutput)
    }

    if (!fileExtension) return null;

    const dstFilePath = file.name.includes(`.${fileExtension}`)
      ? path.join(dstFolderPath, file.name)
      : path.join(dstFolderPath, `${file.name}.${fileExtension}`)

    copy(filePath, dstFilePath)
  }
}


const opendir = (dirPath) => {
  let dir = fs.opendirSync(dirPath)
  let dirContent = dir.readSync()

  while (dirContent) {
    if (!dirContent) break

    if (dirContent.isDirectory())
      handleDir(dirPath, dirContent)
    else if (dirContent.isFile())
      handleFile(dirPath, dirContent)

    dirContent = dir.readSync()
  }

  dir.closeSync()
}


opendir('input')

console.log('DONE')
