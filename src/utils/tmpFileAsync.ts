export interface TmpFile {
  fd: number
  name: string
  cleanup: () => void
}

async function tmpFileAsync(): Promise<TmpFile> {
  const { file } = await import('tmp')

  return new Promise<TmpFile>((resolve, reject) => {
    file((error, name, fd, cleanup) => {
      if (error) {
        return reject(error)
      }

      resolve({
        fd,
        name,
        cleanup
      })
    })
  })
}

export default tmpFileAsync
