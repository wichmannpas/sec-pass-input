(function () {
  function byteArrayToString (array) {
    let result = ''
    for (let i = 0; i < array.byteLength; i++) {
      result += String.fromCharCode(array[i])
    }
    return result
  }

  const demoInput = document.getElementById('demo-input')
  const demo = window.createSecurePasswordInput(demoInput)

  const demoDisplay = document.getElementById('secure-password-display')
  demoInput.oninput = passwordData => {
    demoDisplay.innerText = byteArrayToString(passwordData.value)
  }

  const demoInputOnscreen = document.getElementById('demo-input-onscreen')
  const demoOnscreen = window.createSecurePasswordInput(demoInputOnscreen, {
    enforceOnscreenKeyboard: true
  })

  const demoDisplayOnscreen = document.getElementById('secure-password-onscreen-display')
  demoInputOnscreen.oninput = passwordData => {
    demoDisplayOnscreen.innerText = byteArrayToString(passwordData.value)
  }

  const demoInputNoDots = document.getElementById('demo-input-nodots')
  const demoNoDots = window.createSecurePasswordInput(demoInputNoDots, {
    displayDots: false
  })
  const demoDisplayNoDots = document.getElementById('secure-password-nodots-display')
  demoInputNoDots.oninput = passwordData => {
    demoDisplayNoDots.innerText = byteArrayToString(passwordData.value)
  }

  const nativeInput = document.getElementById('native-input')
  const nativeDisplay = document.getElementById('native-password-display')
  nativeInput.onchange = event => {
    nativeDisplay.innerText = event.target.value
  }
  nativeInput.oninput = nativeInput.onchange
})();