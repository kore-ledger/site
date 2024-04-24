---
date: 2024-04-19
title: Flutter Rust Bridge 🦀 A History of Innovation and Challenges
linkTitle: Flutter Rust Bridge 🦀
description: >
  A guide on how to get started with Flutter Rust Bridge and the advantages it offers for application development.
resources:
  - src: "**.{png,jpg}"
    title: "Image #:counter"
---

## Introduction

A few years ago, in a corner of the technology world, a group of visionary developers sought to combine the best of two worlds: the power and security of Rust with the versatility of Flutter. Thus was born __Flutter Rust Bridge__, a tool that breaks new ground for developers who want to integrate Rust code into Flutter applications.

The story begins with the need to leverage the advantages of both languages. Rust, known for its performance and memory safety, promised a bright future, while Flutter offered the ability to create attractive and efficient user interfaces. Together, these two languages could take application development to a new level.

{{< imgproc sunset Fill "1800x300" >}}
{{< /imgproc >}}

### How to use Flutter with Rust?

### The First Steps

The journey begins with installing the prerequisites, first you need to have Flutter and Rust installed on your machine. You can find the installation instructions at the following links:

- [Flutter installation](https://flutter.dev/docs/get-started/install)
- [Rust installation](https://www.rust-lang.org/tools/install)

{{< alert type="warning" title="Warning">}}Be sure to run `flutter doctor` and resolve any problems before you start working with __Flutter Rust Bridge__. This tool verifies that you have all the dependencies and configurations needed to work with Flutter.{{< /alert >}}


### The Creation of the Project
With the foundation in place, developers take the next step: starting a new project. This is where the magic really begins. To start the project we must run the following command that will allow us to install the [flutter_rust_bridge_codegen](https://github.com/fzyzcjy/flutter_rust_bridge) library responsible among other things for performing the conversion from rust to dart.
```bash
cargo install 'flutter_rust_bridge_codegen@^2.0.0-dev.0' && flutter_rust_bridge_codegen create my_app && cd my_app
```
Next we will proceed to create our first function in rust, in this case we are going to consume an endpoint that allows the registration of a user. The path where we will write the function is `rust/src/api/request.rs`.
```rust
#[derive(Serialize, Clone)]
pub struct UserAuth {
  pub username: String,
  pub password: String, 
}
pub async fn register(username: String, password: String) -> Result<String, String> {
    let body = UserAuth { password, username };
    let client = reqwest::Client::new();
    match client
        .post("http://localhost:3030/register")
        .json(&body)
        .send()
        .await
    {
        Ok(res) => {
            let fail = !res.status().is_success();
            match res.json().await {
                Ok(username_or_error) => {
                    if fail {
                        Err(username_or_error)
                    } else {
                        Ok(username_or_error)
                    }
                }
                Err(e) => Err(format!("{}", e)),
            }
        }
        Err(e) => Err(format!("{}", e)),
    }
}
```
To transform the rust code to dart code we must execute the following command:
```bash
flutter_rust_bridge_codegen generate
```
Note that only the types that have been used in the functions will be converted.
You should create the following in the path `rust/src/api/request.dart`.

```dart
Future<String> register(
        {required String username, required String password, dynamic hint}) =>
    RustLib.instance.api
        .register(username: username, password: password, hint: hint);

Future<String> register(
      {required String username, required String password, dynamic hint}) {
    return handler.executeNormal(NormalTask(
    //  Rust function call
      callFfi: (port_) {
        final serializer = SseSerializer(generalizedFrbRustBinding);
        // Data are serialized
        sse_encode_String(username, serializer);
        sse_encode_String(password, serializer);
        pdeCallFfi(generalizedFrbRustBinding, serializer,
            funcId: 7, port: port_);
      },
      codec: SseCodec(
        decodeSuccessData: sse_decode_String,
        decodeErrorData: sse_decode_String,
      ),
      constMeta: kRegisterConstMeta,
      argValues: [username, password],
      apiImpl: this,
      hint: hint,
    ));
  }

class UserAuth {
  final String username;
  final String password;

  const ResUsersPag({
    required this.username,
    required this.password,
  });

  @override
  int get hashCode =>
      username.hashCode ^ password.hashCode;
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ResUsersPag &&
          runtimeType == other.runtimeType &&
          username == other.username &&
          password == other.password &&
}
```
We can see how a function has been created transforming the _async_ to _Future_ in dart and a task is created that makes a call to the rust(`callFfi`) function taking a port, defined in `_port`. Within the call the arguments of the user name and password are passed.
Subsequently the _struct_ has been transformed to a class with attributes of type _String_. In addition, a getter is performed to obtain the class data and an overload of the `==` operator.

{{< alert type="warning"  title="Warning" >}}In this example basic types like _String_ have been used but not all rust types are currently supported for conversion. To review the types please go to this [link](https://cjycode.com/flutter_rust_bridge/guides/types) {{< /alert >}}

Finally from our flutter application we can import and use this function.

```dart
import 'package:app/components/api/request.dart';

register(username: usernameController.text,password: passwordController.text)
    .then((response) {
    }).catchError((error) {
    }).whenComplete(() {
    });
```
### Construction
In case of making a development deployment we will have to execute the following commands:
```bash
flutter_rust_bridge_codegen build-web 
# De esta manera evitaremos los problemas de Cors. 
flutter run --web-header=Cross-Origin-Opener-Policy=same-origin --web-header=Cross-Origin-Embedder-Policy=require-corp
```
To realize the final construction
```bash
flutter build web 
```
In case of a build for applications
```bash
flutter build [macos|ios|apk|window]
```
{{< alert type="warning"  title="Warning" >}}Depending on the host that performs the build we can compile for other systems, for example if we are on Windows we can only build for Android and Windows, if we are on Mac we can build for iOS, Mac and Android.{{< /alert >}}


## Architecture

The __Flutter Rust Bridge__ architecture is designed to provide cross-platform compatibility and a seamless connection between Dart functionality in Flutter and Rust code.

The [external function interface](https://dart.dev/interop/c-interop) is essential to this architecture, as it allows one language to call code from another language. In our case, Dart FFI is used to access Rust functions from a Flutter application.

In this framework, we start from a Rust library and create a link to expose Rust functions to external code, in this case, through Rust FFI. From the Flutter side, you use Dart FFI to reach the native layer and call the appropriate Rust functions. In this way, you can integrate native functionality into your Flutter application using Rust code.

Integrating Rust into Flutter through the __Flutter Rust Bridge__ results in natively compiled applications with performance on par with native code. This solution allows you to leverage the strengths of Rust on a variety of supported platforms, including Android, iOS, Windows, Linux and even web, thus providing more efficient cross-platform mobile development.


## Threading
Flutter provides support for thread handling through different mechanisms depending on the target platform. The following details how to handle threads in different Flutter environments:

### Web
When it comes to Flutter applications intended for the web, threads are handled using _Web Workers_. These allow background tasks to be performed to avoid blocking the user interface (UI), improving the efficiency and responsiveness of the application.

### Native
For Flutter applications running on native platforms, thread handling is done using _Isolates_. The _Isolates_ are a Dart-independent form of execution that can execute its own code and memory.

> Although different techniques have to be performed depending on the target platform, it is possible to use libraries such as [isolated_worker ](https://pub.dev/packages/isolated_worker) that allow within the same program to detect the execution by _Isolated_ or _Web Workers_ depending on the platform.

## Advantages

- **Improved performance**: Rust is known for its high performance and memory safety. By using Rust for application logic, you can improve the performance of your Flutter application.

- **Safe code**: Rust has memory safety features that help avoid common errors such as buffer overflows and race conditions.

- **Shared code**: You can write shared logic in Rust and use it both in the Flutter application and on other platforms, making cross-platform development easy.

- **Recent updates**: The Flutter Rust Bridge community is constantly adding issues and updates to improve the features of the library. Recent updates include support for the str type in dart.

## Drawbacks

- **Learning curve**: Learning Rust can be a challenge, especially for developers new to the language.

- **Smaller community**: Although Rust has an active community, it is smaller compared to other languages such as JavaScript or Python. This could make it more difficult to find examples or documentation specific to Flutter integration.

- **Types**: Currently not all Rust types are supported in Dart.

## Conclusion

In conclusion, __Flutter Rust Bridge__ is a powerful tool that allows you to integrate Rust code into Flutter applications, combining the efficiency and security of Rust with the versatility and user interface creation capabilities of Flutter. This integration can significantly improve application performance and provides secure, reusable code.

Despite the benefits, it is important to keep in mind some challenges, such as Rust's learning curve and limitations in the community and supported data types. However, with careful planning and a well-structured development approach, these disadvantages can be overcome.

In the end, __Flutter Rust Bridge__ offers developers a unique opportunity to create modern, powerful and secure applications, taking advantage of the best of both worlds: Rust and Flutter. With practice and experience, developers can learn to use this tool effectively and achieve excellent results in their projects.

> Coming together is a beginning. Keeping together is progress. Working together is success. — Henry Ford