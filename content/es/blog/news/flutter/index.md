---
date: 2024-04-19
title: Flutter Rust Bridge 🦀 Una Historia de Innovación y Desafíos
linkTitle: Flutter Rust Bridge 🦀
description: >
  Una guía sobre cómo comenzar a usar Flutter Rust Bridge y las ventajas que ofrece para el desarrollo de aplicaciones.
resources:
  - src: "**.{png,jpg}"
    title: "Image #:counter"
---

## Introducción

Hace unos años, en un rincón del mundo tecnológico, un grupo de desarrolladores visionarios buscaba combinar lo mejor de dos mundos: la potencia y seguridad de Rust con la versatilidad de Flutter. Así nació __Flutter Rust Bridge__, una herramienta que abre un nuevo camino para los desarrolladores que desean integrar código Rust en aplicaciones Flutter.

La historia comienza con la necesidad de aprovechar las ventajas de ambos lenguajes. Rust, conocido por su rendimiento y seguridad en la memoria, prometía un futuro brillante, mientras que Flutter ofrecía la capacidad de crear interfaces de usuario atractivas y eficientes. Juntos, estos dos lenguajes podrían llevar el desarrollo de aplicaciones a un nuevo nivel.

{{< imgproc sunset Fill "1800x300" >}}
{{< /imgproc >}}

## ¿Cómo usar Flutter con Rust?

### Los Primeros Pasos

El viaje comienza con la instalación de los requisitos previos, primero necesitas tener Flutter y Rust instalados en tu máquina. Puedes encontrar las instrucciones de instalación en los siguientes enlaces:

- [Instalación de Flutter](https://flutter.dev/docs/get-started/install)
- [Instalación de Rust](https://www.rust-lang.org/tools/install)

{{< alert type="warning"  title="Advertencia" >}}Asegúrate de ejecutar `flutter doctor` y resolver cualquier problema que se presente antes de comenzar a trabajar con __Flutter Rust Bridge__. Esta herramienta verifica que tengas todas las dependencias y configuraciones necesarias para trabajar con Flutter.{{< /alert >}}

### La Creación del Proyecto
Con los cimientos en su lugar, los desarrolladores dan el siguiente paso: iniciar un nuevo proyecto. Aquí es donde la magia realmente comienza. Para iniciar el proyecto debemos ejecutar el siguiente comando que nos permitira instalar la librería [flutter_rust_bridge_codegen](https://github.com/fzyzcjy/flutter_rust_bridge) encargada entre otras cosas de realizar la conversión de rust a dart.
```bash
cargo install 'flutter_rust_bridge_codegen@^2.0.0-dev.0' && flutter_rust_bridge_codegen create my_app && cd my_app
```
Posteriormente procederemos a crear nuestra primera funcion en rust, en este caso vamos a consumir un endpoint que permite el registro de un usuario. La ruta donde escribiremos la funcion es `rust/src/api/request.rs`.
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
Para realizar la transformación del código rust a código dart deberemos ejecutar el siguiente comando:
```bash
flutter_rust_bridge_codegen generate
```
Destacar que solo se realizara la conversion de los tipos que se hayan usado en las funciones.
Debería crear lo siguiente en la ruta `rust/src/api/request.dart`.

```dart
Future<String> register(
        {required String username, required String password, dynamic hint}) =>
    RustLib.instance.api
        .register(username: username, password: password, hint: hint);

Future<String> register(
      {required String username, required String password, dynamic hint}) {
    return handler.executeNormal(NormalTask(
    // Llamada a la función Rust
      callFfi: (port_) {
        final serializer = SseSerializer(generalizedFrbRustBinding);
        // Se serializan los datos
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
Podemos observar como se ha creado una función transformado el _async_ a _Future_ en dart y se crea una tarea que realiza una llamada a la función de rust(`callFfi`) tomando un puerto, definido en `_port`. Dentro de la llamada se pasan los argumentos del nombre y contraseña del usuario.
Posteriormente se ha tranformado el _struct_ a una clase con los atributos de tipo _String_. Además se realiza un getter para obtener los datos de la clase y una sobrecarga del operador `==`.

{{< alert type="warning" title="Advertencia" >}}En este ejemplo se han usado tipo básicos como _String_ pero  no todos los tipos de rust tienen conversión actualmente soportada. Para revisar los tipos dirijase a este [enlace](https://cjycode.com/flutter_rust_bridge/guides/types)  {{< /alert >}}

Por último desde nuestra applicación de flutter podremos importar y usar esa función.

```dart
import 'package:app/components/api/request.dart';

register(username: usernameController.text,password: passwordController.text)
    .then((response) {
    }).catchError((error) {
    }).whenComplete(() {
    });
```
### Contrucción
En caso de hacer un despliegue de desarrollo deberemos ejecutar los siguientes comandos:
```bash
flutter_rust_bridge_codegen build-web 
# De esta manera evitaremos los problemas de Cors. 
flutter run --web-header=Cross-Origin-Opener-Policy=same-origin --web-header=Cross-Origin-Embedder-Policy=require-corp
```
Para realizar la contrucción final
```bash
flutter build web 
```
En caso de un build para aplicaciones
```bash
flutter build [macos|ios|apk|window]
```
{{< alert type="warning"title="Advertencia"  >}}Dependiendo del host que realice el build podremos compilar para otros sistemas por ejemplo si estamos en Windows solo podremos hacer build para Android y Windows, si estamos en Mac podremos hacer build en Ios, Mac y Android.{{< /alert >}}


## Arquitectura

La arquitectura de __Flutter Rust Bridge__ está diseñada para proporcionar compatibilidad multiplataforma y una conexión perfecta entre las funcionalidades de Dart en Flutter y el código de Rust.

La [interfaz de función externa](https://dart.dev/interop/c-interop) es esencial para esta arquitectura, ya que permite que un lenguaje llame al código de otro lenguaje. En nuestro caso, Dart FFI se utiliza para acceder a funciones de Rust desde una aplicación Flutter.

En esta estructura, se parte de una biblioteca de Rust y se crea un enlace para exponer las funciones de Rust al código externo, en este caso, a través de Rust FFI. Desde el lado de Flutter, se utiliza Dart FFI para llegar a la capa nativa y llamar a las funciones apropiadas de Rust. De esta manera, puedes integrar funcionalidades nativas en tu aplicación Flutter mediante el código Rust.

La integración de Rust en Flutter a través de __Flutter Rust Bridge__ da como resultado aplicaciones compiladas de forma nativa con un rendimiento equiparable al del código nativo. Esta solución permite aprovechar las fortalezas de Rust en una variedad de plataformas compatibles, incluyendo Android, iOS, Windows, Linux e incluso web, ofreciendo así un desarrollo móvil multiplataforma más eficiente.


## Uso de Hilos
Flutter ofrece soporte para el manejo de hilos a través de diferentes mecanismos según la plataforma de destino. A continuación, se detalla cómo manejar hilos en diferentes entornos de Flutter:

### Web
Cuando se trata de aplicaciones Flutter destinadas a la web, los hilos se manejan utilizando _Web Workers_. Estos permiten realizar tareas en segundo plano para evitar bloquear la interfaz de usuario (UI), mejorando la eficiencia y la capacidad de respuesta de la aplicación.

### Nativo
Para las aplicaciones Flutter que se ejecutan en plataformas nativas, el manejo de hilos se realiza mediante _Isolates_. Los _Isolates_ son una forma de ejecución independiente de Dart que puede ejecutar su propio código y memoria.

> Aunque se tengan que realizar diferentes técnicas dependiendo de la plataforma de destino, se pueden utilizar librerías como [isolated_worker ](https://pub.dev/packages/isolated_worker) que permiten dentro del mismo programa detectar dependiendo de la plataforma la ejecución mediante _Isolated_ o _Web Workers_.

## Ventajas

- **Rendimiento mejorado**: Rust es conocido por su alto rendimiento y seguridad en la memoria. Al usar Rust para la lógica de la aplicación, puedes mejorar el rendimiento de tu aplicación Flutter.

- **Código seguro**: Rust tiene características de seguridad de memoria que ayudan a evitar errores comunes, como desbordamientos de buffer y condiciones de carrera.

- **Código compartido**: Puedes escribir lógica compartida en Rust y usarla tanto en la aplicación Flutter como en otras plataformas, lo que facilita el desarrollo multiplataforma.

- **Actualizaciones recientes**: La comunidad de flutter Rust Bridge esta añadiendo constantement Issues y actualizaciones para mejorar las características de la librería. Entre las actualizaciones recientes podemos destacar el soporte para el tipo str en dart.

## Inconvenientes

- **Curva de aprendizaje**: Aprender Rust puede ser un desafío, especialmente para desarrolladores nuevos en el lenguaje.

- **Comunidad más pequeña**: Aunque Rust tiene una comunidad activa, es más pequeña en comparación con otros lenguajes como JavaScript o Python. Esto podría hacer que sea más difícil encontrar ejemplos o documentación específicos para la integración con Flutter.

- **Tipos**: Actualmente no todos los tipos de Rust tienen soporte en Dart.

## Conclusión

En conclusión, __Flutter Rust Bridge__ es una herramienta poderosa que permite integrar código Rust en aplicaciones Flutter, combinando la eficiencia y seguridad de Rust con la versatilidad y capacidad de creación de interfaces de usuario de Flutter. Esta integración puede mejorar significativamente el rendimiento de las aplicaciones y ofrece código seguro y reutilizable.

A pesar de los beneficios, es importante tener en cuenta algunos desafíos, como la curva de aprendizaje de Rust y las limitaciones en la comunidad y tipos de datos compatibles. Sin embargo, con una planificación cuidadosa y un enfoque de desarrollo bien estructurado, estas desventajas se pueden superar.

Al final, __Flutter Rust Bridge__ ofrece a los desarrolladores una oportunidad única para crear aplicaciones modernas, potentes y seguras, aprovechando lo mejor de ambos mundos: Rust y Flutter. Con práctica y experiencia, los desarrolladores pueden aprender a usar esta herramienta de manera efectiva y obtener excelentes resultados en sus proyectos.

> Unirse es un comienzo. Mantenerse juntos es un progreso. Trabajar juntos es el éxito. — Henry Ford