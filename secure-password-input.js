// TODO: allow to provide a max length

(function () {
  const DEFAULT_ARRAY_SIZE = 100
  const CONTROL_KEYS = [
    'Backspace', 'Delete',
    'ArrowLeft', 'ArrowRight',
    'Home', 'End',
  ]
  const ALLOWED_KEYS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',

    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

    'ä', 'Ä', 'ö', 'Ö', 'ü', 'Ü', 'ß',
    // TODO: more special characters

    ' ', '*', '^', '&', '/', '\\', '(', ')', '{', '}', '<', '>', '[', ']', '#', '@', '!', '?', '.', ',',
    ';', ':', "'", '"', '%', '$', '~', '+', '-', '_', '`', '|',
  ]
  const HANDLED_KEYS = CONTROL_KEYS + ALLOWED_KEYS
  const ONSCREEN_KEYBOARD_KEYS = [
    [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '\\'],
      ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ArrowLeft', 'ArrowRight'],
      [' '],
    ],
    [
      ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'Backspace'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', '|'],
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'ArrowLeft', 'ArrowRight'],
      [' '],
    ]
  ]

  function overwriteArray (array) {
    for (let i = 0; i < array.byteLength; i++) {
      array[i] = 0
    }
  }

  window.createSecurePasswordInput = (input, options = {}) => {
    const passwordData = {
      value: new Uint8Array(DEFAULT_ARRAY_SIZE),
      length: 0
    }
    let cursorPosition = -1
    const enforceOnscreenKeyboard = options.enforceOnscreenKeyboard === true
    const displayDots = options.displayDots === undefined ? true : options.displayDots

    function expandArray (requiredLength) {
      if (requiredLength <= passwordData.value.byteLength)
        return
      let newLength = passwordData.value.byteLength
      do {
        newLength *= 2
      } while (newLength < requiredLength)
      const newValue = new Uint8Array(newLength)
      for (let i = 0; i < passwordData.value.byteLength; i++) {
        newValue[i] = passwordData.value[i]
      }
      overwriteArray(passwordData.value)
      delete passwordData.value
      passwordData.value = newValue
    }

    /**
     * Set the value of this secure input to value.
     *
     * @param value
     * @param overwriteValue Whether to securely erase the passed value.
     */
    passwordData.setValue = (value, overwriteValue = true) => {
      expandArray(value.byteLength)

      overwriteArray(passwordData.value)
      for (let i = 0; i < value.byteLength; i++) {
        passwordData.value[i] = value[i]
      }
      passwordData.length = value.byteLength
      cursorPosition = passwordData.length - 1
      updateDotDisplay()

      if (overwriteValue)
        overwriteArray(value)
    }

    /**
     * Get a copy of the value in an array of the proper length. The caller is
     * responsible to securely erase this copy!
     */
    passwordData.getValueCopy = () => {
      const value = new Uint8Array(passwordData.length)
      for (let i = 0; i < passwordData.length; i++)
        value[i] = passwordData.value[i]
      return value
    }
    passwordData.overwriteValueCopy = value => overwriteArray(value)

    passwordData.clear = () => {
      overwriteArray(passwordData.value)
      passwordData.length = 0
      cursorPosition = -1
      updateDotDisplay()
    }

    // make element focusable so we can listen to events
    input.tabIndex = 0

    input.classList.add('secure-password-input')
    const inputDots = document.createElement('div')
    inputDots.classList.add('input-dots')
    input.appendChild(inputDots)

    const cursor = document.createElement('span')
    cursor.classList.add('cursor')
    cursor.innerText = 'l'
    inputDots.appendChild(cursor)

    // create on-screen keyboard
    const keyboard = document.createElement('div')
    keyboard.classList.add('onscreen-keyboard', 'hidden')
    input.parentNode.insertBefore(keyboard, input.nextSibling)
    // add keys
    ONSCREEN_KEYBOARD_KEYS.forEach((keyboardInstance, keyboardInstanceNumber) => {
      keyboardInstance.forEach(keyboardRow => {
        keyboardRow.forEach(key => {
          const keyElem = document.createElement('div')
          if (key === 'Backspace') {
            keyElem.textContent = '⬅'
            keyElem.classList.add('backspace-key')
          } else if (key === 'Shift') {
            keyElem.textContent = '⇧'
            keyElem.classList.add('shift-key')
          } else if (key === 'ArrowLeft') {
            keyElem.textContent = '←'
            keyElem.classList.add('arrow-key')
          } else if (key === 'ArrowRight') {
            keyElem.textContent = '→'
            keyElem.classList.add('arrow-key')
          } else if (key === ' ') {
            keyElem.classList.add('space-key')
          } else {
            keyElem.textContent = key
          }
          keyElem.classList.add('key')
          if (keyboardInstanceNumber === 0) {
            keyElem.classList.add('no-shift')
          } else {
            keyElem.classList.add('shift')
          }
          keyElem.addEventListener('click', event => {
            event.preventDefault()
            input.focus()
            if (key === 'Shift') {
              if (keyboard.classList.contains('shift-active')) {
                keyboard.classList.remove('shift-active')
              } else {
                keyboard.classList.add('shift-active')
              }
            } else {
              handleInput({
                key: key,
                preventDefault: () => 0,
              }, true)
            }
          })
          keyboard.appendChild(keyElem)
        })
        const lineBreak = document.createElement('div')
        keyboard.appendChild(lineBreak)
      })
    })

    const keyboardToggle = document.createElement('span')
    keyboardToggle.classList.add('onscreen-keyboard-toggle')
    if (enforceOnscreenKeyboard) {
      keyboard.classList.remove('hidden')
      keyboardToggle.classList.add('active')
    } else {
      keyboardToggle.addEventListener('click', () => {
        if (keyboard.classList.contains('hidden')) {
          keyboard.classList.remove('hidden')
          keyboardToggle.classList.add('active')
        } else {
          keyboard.classList.add('hidden')
          keyboardToggle.classList.remove('active')
        }
      })
    }
    input.appendChild(keyboardToggle)

    function updateDotDisplay () {
      if (!displayDots)
        return

      inputDots.innerHTML = ''
      if (cursorPosition === -1) {
        inputDots.appendChild(cursor)
      }
      for (let i = 0; i < passwordData.length; i++) {
        inputDots.innerHTML += '&bull;'
        if (cursorPosition === i) {
          inputDots.appendChild(cursor)
        }
      }

      // scroll display to cursor
      if (inputDots.offsetWidth === inputDots.scrollWidth)
        return
      const charCount = passwordData.length + 1
      const charWidth = inputDots.scrollWidth / charCount
      inputDots.scrollTo(charWidth * cursorPosition, 0)
    }

    updateDotDisplay()

    function handleInput (event, fromOnscreenKeyboard = false) {
      if (enforceOnscreenKeyboard && fromOnscreenKeyboard !== true) {
        // ignore regular key events if onscreen keyboard is enforced
        return
      }

      if (typeof input.onenter === 'function' && event.key === 'Enter') {
        input.onenter(passwordData)
        return
      }

      if (HANDLED_KEYS.indexOf(event.key) === -1) {
        return
      }
      // ignore ctrl and alt keys, except if it is ctrl-arrow or ctrl-backspace
      if (
        (event.ctrlKey && !(event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          || event.key === 'Backspace' || event.key === 'Delete'))
        || event.altKey || event.metaKey) {
        return
      }
      event.preventDefault()

      if (ALLOWED_KEYS.indexOf(event.key) >= 0) {
        passwordData.length++

        expandArray(passwordData.length)

        // shift all characters right of the insert position one place to the right
        for (let i = passwordData.length; i > cursorPosition; i--) {
          passwordData.value[i] = passwordData.value[i - 1]
        }
        passwordData.value[cursorPosition + 1] = event.key.charCodeAt(0)

        cursorPosition++
      } else if (event.key === 'Home' || (event.ctrlKey && event.key === 'ArrowLeft')) {
        cursorPosition = -1
      } else if (event.key === 'ArrowLeft') {
        if (cursorPosition < 0) {
          return
        }
        cursorPosition--
      } else if (event.key === 'End' || (event.ctrlKey && event.key === 'ArrowRight')) {
        cursorPosition = passwordData.length - 1
      } else if (event.key === 'ArrowRight') {
        if (cursorPosition >= passwordData.length - 1) {
          return
        }
        cursorPosition++
      } else if (event.key === 'Backspace') {
        if (cursorPosition < 0) {
          return
        }

        // shift one (no ctrl) or all (ctrl) characters right of the cursor to the left
        let shift = 1
        let start = cursorPosition
        if (event.ctrlKey) {
          shift = cursorPosition + 1
          start = 0
        }
        let newLength = passwordData.length - shift
        for (let i = start; i < passwordData.length; i++) {
          passwordData.value[i] = passwordData.value[i + shift]
        }

        passwordData.length = newLength
        if (event.ctrlKey) {
          cursorPosition = -1
        } else {
          cursorPosition--
        }
      } else if (event.key === 'Delete') {
        if (cursorPosition >= passwordData.length - 1) {
          return
        }

        if (event.ctrlKey) {
          // overwrite all characters right of the cursor
          for (let i = cursorPosition + 1; i < passwordData.length; i++) {
            passwordData.value[i] = 0
          }
          passwordData.length = cursorPosition + 1
        } else {
          // shift all characters right of the cursor one to the left
          passwordData.length--
          for (let i = cursorPosition + 1; i < passwordData.length; i++) {
            passwordData.value[i] = passwordData.value[i + 1]
          }
          passwordData.value[passwordData.length] = 0
        }
      } else {
        console.error('Unhandled event/key:')
        console.error(event)
        return
      }

      if (typeof input.oninput === 'function') {
        input.oninput(passwordData)
      }
      if (typeof input.onchange === 'function') {
        input.onchange(passwordData)
      }

      updateDotDisplay()
    }

    // listen to keys
    input.addEventListener('keydown', handleInput)

    return passwordData
  }
})()
