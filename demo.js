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

  const nativeInput = document.getElementById('native-input')
  const nativeDisplay = document.getElementById('native-password-display')
  nativeInput.onchange = event => {
    nativeDisplay.innerText = event.target.value
  }
  nativeInput.oninput = nativeInput.onchange
})();