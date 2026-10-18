// Keep avatar photos small enough to save with the profile in localStorage.
export async function prepareProfilePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG or WebP photo.')
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose a photo smaller than 10 MB.')

  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('This photo could not be read. Try another photo.'))
    reader.onabort = () => reject(new Error('Photo selection was cancelled.'))
    reader.readAsDataURL(file)
  })
  const image = await new Promise((resolve, reject) => {
    const picture = new Image()
    picture.onload = () => resolve(picture)
    picture.onerror = () => reject(new Error('This photo could not be opened. Try a JPG, PNG or WebP photo.'))
    picture.src = source
  })

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not prepare the photo. Please try again.')
  const crop = Math.min(image.naturalWidth, image.naturalHeight)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 256, 256)
  context.drawImage(image, (image.naturalWidth - crop) / 2, (image.naturalHeight - crop) / 2, crop, crop, 0, 0, 256, 256)
  const photo = canvas.toDataURL('image/jpeg', .85)
  if (!photo.startsWith('data:image/jpeg;base64,') || photo.length > 200000) {
    throw new Error('This photo could not be prepared. Please try another photo.')
  }
  return photo
}
