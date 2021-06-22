(function () {
  const CONTROL_KEYS = [
    'Backspace', 'Delete',
    'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft',
  ]
  const ALLOWED_KEYS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',

    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

    'ä', 'Ä', 'ö', 'Ö', 'ü', 'Ü', 'ß',
    // TODO: more special characters

    '*', '/', '\\', '(', ')', '[', ']',
  ]
  const HANDLED_KEYS = CONTROL_KEYS + ALLOWED_KEYS

  // TODO: allow to provide a max length
  // TODO: change handler/onchange callback
  // TODO: allow to disable dot display

  function overwriteArray (array) {
    for (let i = 0; i < array.byteLength; i++) {
      array[i] = 0
    }
  }

  window.createSecurePasswordInput = (input) => {
    const passwordData = {
      value: new Uint8Array(0),
      input
    }
    let cursorPosition = -1

    // make element focusable so we can listen to events
    input.tabIndex = 0

    input.classList.add('secure-password-input')

    function updateDotDisplay () {
      let display = ''
      if (cursorPosition === -1) {
        display += '<span class="cursor">l</span>'
      }
      for (let i = 0; i < passwordData.value.byteLength; i++) {
        display += '&bull;'
        if (cursorPosition === i) {
          display += '<span class="cursor">l</span>'
        }
      }
      input.innerHTML = display
    }

    updateDotDisplay()


    // listen to keys
    input.addEventListener('keydown', event => {
      if (HANDLED_KEYS.indexOf(event.key) === -1) {
        return
      }
      if (event.ctrlKey || event.altKey) {
        return
      }
      event.preventDefault()

      if (ALLOWED_KEYS.indexOf(event.key) >= 0) {
        // TODO: cursor support – insert the character somewhere else!

        // update value
        const newValue = new Uint8Array(passwordData.value.byteLength + 1)
        newValue.set(passwordData.value)
        newValue[newValue.length - 1] = event.key.charCodeAt(0)

        // overwrite old value with zeros
        overwriteArray(passwordData.value)

        passwordData.value = newValue
        cursorPosition++
      } else if (event.key === 'ArrowLeft') {
        if (cursorPosition < 0) {
          return
        }
        cursorPosition--
      } else if (event.key === 'ArrowRight') {
        if (cursorPosition >= passwordData.value.byteLength - 1) {
          return
        }
        cursorPosition++
      } else if (event.key === 'Backspace') {
        if (cursorPosition < 0) {
          return
        }

        cursorPosition--

        // TODO!
      } else {
        // TODO
        console.log(event)
      }

      updateDotDisplay()
    })

    return passwordData
  }
})();