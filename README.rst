Secure Password Input Library
#############################

This library provides a non-native password input that allows to read values directly into a UInt8Array, allowing the application to keep full control over it.
Especially, this means that the application can override the value after processing it, immediately removing it from the memory rather than relying on the browser's garbage collector to actually clean the memory and the value being overwritten.
Native browser inputs require handling through JavaScript string variables, which cannot be cleared by the application.
Then, it depends on the browser if and when such values are removed from the memory. 
