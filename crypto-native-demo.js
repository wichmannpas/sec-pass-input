(function () {
  const passwordInput = document.getElementById('password-input')
  const saltInput = document.getElementById('salt-input')

  const keyDisplay = document.getElementById('key-display')
  const saltDisplay = document.getElementById('salt-display')

  function bufferToBase64 (value) {
    let binary = '';
    let bytes = new Uint8Array(value);
    for (let i = 0; i < value.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function byteArrayToString (array) {
    let result = ''
    for (let i = 0; i < array.byteLength; i++) {
      result += String.fromCharCode(array[i])
    }
    return result
  }

  function stringToByteArray (value) {
    let result = new Uint8Array(value.length)
    for (let i = 0; i < value.length; i++) {
      result[i] = value.charCodeAt(i)
    }
    return result
  }

  saltInput.value = byteArrayToString(window.crypto.getRandomValues(new Uint8Array(16)))

  async function deriveKey () {
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      stringToByteArray(passwordInput.value),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    passwordInput.value = ''
    // we cannot call a secure clear operation here!

    let key = await window.crypto.subtle.deriveKey(
      {
        'name': 'PBKDF2',
        salt: stringToByteArray(saltInput.value),
        'iterations': 100000,
        'hash': 'SHA-256'
      },
      passwordKey,
      {
        'name': 'AES-GCM',
        'length': 256
      },
      true,
      ['encrypt', 'decrypt']
    )
    keyDisplay.innerText = bufferToBase64(await window.crypto.subtle.exportKey('raw', key))
    saltDisplay.innerText = btoa(saltInput.value)
  }

  passwordInput.onkeyup = event => {
    if (event.key === 'Enter')
      deriveKey()
  }
  saltInput.onkeyup = passwordInput.onkeyup
  document.getElementById('derive').onclick = deriveKey
})();