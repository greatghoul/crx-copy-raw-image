function copyImageToClipboard(imageUrl) {
  const image = new Image()
  image.crossOrigin = "Anonymous"
  image.onload = function () {
    const canvas = document.createElement("canvas")
    canvas.width = this.width
    canvas.height = this.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(this, 0, 0)

    const dataURL = canvas.toDataURL("image/png")
		console.log(dataURL)
  }
  image.src = imageUrl
}

// function copyImageToClipboard(imageUrl) {
// 	const image1 = new Image()
// 	image1.onload = () => {
// 		const canvas1 = new OffscreenCanvas(image1.naturalWidth, image1.naturalHeight)
// 		// canvas1.width = image1.naturalWidth
// 		// canvas1.height = image1.naturalHeight

// 		const context1 = canvas1.getContext("2d")
// 		context1.drawImage(image1, 0, 0)

// 		// const image2 = new Image()
// 		// image2.crossOrigin = "Anonymous"
// 		// image2.onload = () => {
// 		// 	const canvas2 = document.createElement("canvas")
// 		// 	canvas2.width = image2.naturalWidth
// 		// 	canvas2.height = image2.naturalHeight
	
// 		// 	const context2 = canvas2.getContext("2d")
// 		// 	context2.drawImage(image2, 0, 0)

// 			canvas1.toBlob(blob => {
// 				console.log(blob)
// 				// navigator.clipboard.write([
// 				// 	new ClipboardItem({ "image/png": blob })
// 				// ]).catch(e => console.error(e))
// 			})
// 		// }
// 		// image2.src = canvas1.toDataURL("image/png")
// 	}
// 	image1.src = imageUrl
// }

// const toDataURL = url => fetch(url)
//   .then(response => response.blob())
//   .then(blob => new Promise((resolve, reject) => {

//   }))

async function copyImageToClipboard(imageUrl) {
	try {
		const settings = {
			mode: "same-origin", // no-cors, *cors, same-origin
			cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
			credentials: "include", // include, *same-origin, omit
			referrerPolicy: "origin", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		}
		const resp = await fetch(imageUrl, settings)
		const blob = await resp.blob()
		const dataUrl = await new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})

		const image = new Image()
		image.crossOrigin = 'Anonymous'
		image.onload = () => {
			const canvas = document.createElement("canvas")
			canvas.width = image.naturalWidth
			canvas.height = image.naturalHeight

			const context = canvas.getContext("2d")
			context.drawImage(image, 0, 0)
			
			canvas.toBlob(blob => {
				navigator.clipboard.write([
					new ClipboardItem({ "image/png": blob })
				]).catch(e => console.error(e))
			})	
		}
		image.src = dataUrl
	} catch (e) { console.log(e) }
}

function handleClick (media, tab) {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: copyImageToClipboard,
		args: [media.srcUrl],
	})
}

function installMenus () {
	chrome.contextMenus.create({
		id: "copy_raw_image",
		title: "COPY RAW IMAGE",
		contexts: ["image"],
	})
}

chrome.runtime.onInstalled.addListener(installMenus)
chrome.contextMenus.onClicked.addListener(handleClick)
