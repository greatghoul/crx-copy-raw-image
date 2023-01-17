async function copyImageToClipboard(imageData) {
	try {
		await new Promise((resolve, reject) => {
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
					]).then(resolve).catch(reject)
				})
			}
			image.onerror = e => reject(e)
			image.src = imageData
		})
		return "success"
	} catch (e) {
		return e.message
	}
}

function readImage (blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(blob)	
	})
}

function copyImage (imageData, tabId) {
	chrome.scripting.executeScript({
		target: { tabId },
		func: copyImageToClipboard,
		args: [imageData],
	}, ([{ result },]) => {
		if (result === "success") {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "images/icon.png",
				title: chrome.i18n.getMessage("msgSuccessTitle"),
				message: chrome.i18n.getMessage("msgSuccessMessage"),
			})
		} else {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "images/icon.png",
				title: chrome.i18n.getMessage("msgFailureTitle"),
				message: chrome.i18n.getMessage("msgFailureMessage"),
				contextMessage: result
			})
		}
	})
}

function handleClick (media, tab) {
	fetch(media.srcUrl)
		.then(resp => resp.blob())
		.then(blob => readImage(blob))
		.then(imageData => copyImage(imageData, tab.id))
}

function installMenus () {
	chrome.contextMenus.create({
		id: "copy_raw_image",
		title: chrome.i18n.getMessage("menuName"),
		contexts: ["image"],
	})
}

chrome.runtime.onInstalled.addListener(installMenus)
chrome.contextMenus.onClicked.addListener(handleClick)
