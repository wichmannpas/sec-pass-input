(function () {
  function byteArrayToString (array) {
    let result = ''
    for (let i = 0; i < array.byteLength; i++) {
      if (array[i] === 0) {
        // stop at nullbyte
        break
      }
      result += String.fromCharCode(array[i])
    }
    return result
  }

  let display = true

  const demoInput = document.getElementById('demo-input')
  const demo = window.createSecurePasswordInput(demoInput)

  const demoDisplay = document.getElementById('secure-password-display')
  demoInput.oninput = passwordData => {
    if (!display)
      return
    demoDisplay.innerText = byteArrayToString(passwordData.value)
  }

  const demoInputOnscreen = document.getElementById('demo-input-onscreen')
  const demoOnscreen = window.createSecurePasswordInput(demoInputOnscreen, {
    enforceOnscreenKeyboard: true
  })

  const demoDisplayOnscreen = document.getElementById('secure-password-onscreen-display')
  demoInputOnscreen.oninput = passwordData => {
    if (!display)
      return
    demoDisplayOnscreen.innerText = byteArrayToString(passwordData.value)
  }

  const demoInputNoDots = document.getElementById('demo-input-nodots')
  const demoNoDots = window.createSecurePasswordInput(demoInputNoDots, {
    displayDots: false
  })
  const demoDisplayNoDots = document.getElementById('secure-password-nodots-display')
  demoInputNoDots.oninput = passwordData => {
    if (!display)
      return
    demoDisplayNoDots.innerText = byteArrayToString(passwordData.value)
  }

  const nativeInput = document.getElementById('native-input')
  const nativeDisplay = document.getElementById('native-password-display')
  nativeInput.onchange = event => {
    if (!display)
      return
    nativeDisplay.innerText = event.target.value
  }
  nativeInput.oninput = nativeInput.onchange

  const displays = document.getElementById('displays')
  const toggleDisplayButton = document.getElementById('toggleDisplay')
  toggleDisplayButton.onclick = event => {
    display = !display
    if (display) {
      displays.style.display = 'block'
      nativeDisplay.innerText = nativeInput.value
      demoDisplay.innerText = byteArrayToString(demo.value)
      demoDisplayOnscreen.innerText = byteArrayToString(demoOnscreen.value)
      demoDisplayNoDots.innerText = byteArrayToString(demoNoDots.value)
      toggleDisplayButton.innerText = 'Disable displaying of values'
      toggleDisplayButton.classList.add('btn-error')
      toggleDisplayButton.classList.remove('btn-success')
    } else {
      displays.style.display = 'none'
      nativeDisplay.innerText = ''
      demoDisplay.innerText = ''
      demoDisplayOnscreen.innerText = ''
      demoDisplayNoDots.innerText = ''
      toggleDisplayButton.innerText = 'Enable displaying of values'
      toggleDisplayButton.classList.remove('btn-error')
      toggleDisplayButton.classList.add('btn-success')
    }
  }
})();