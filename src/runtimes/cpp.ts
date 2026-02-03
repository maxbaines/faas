// C++ runtime
// https://github.com/GoogleCloudPlatform/functions-framework-cpp

import { createRuntime } from './base'

export const cpp = createRuntime({
  name: 'cpp',
  displayName: 'C++',
  repo: 'https://github.com/GoogleCloudPlatform/functions-framework-cpp',
  quickstartUrl:
    'https://github.com/GoogleCloudPlatform/functions-framework-cpp/blob/main/examples/site/howto_local_development/README.md',
  checkCommand: 'g++',
  checkArgs: ['--version'],
  installHint:
    'Install g++ via Xcode Command Line Tools or use: brew install gcc',
  buildTools: [
    {
      name: 'CMake',
      command: 'cmake',
      args: ['--version'],
      installHint:
        'Install CMake from https://cmake.org or use: brew install cmake',
    },
  ],
  filePatterns: ['CMakeLists.txt', '*.cpp'],
  runCommand: ['./build/hello_world'],
  dockerfile: `FROM gcr.io/cloud-cpp-testing-resources/cpp-build-image:latest AS build
WORKDIR /app
COPY . .
RUN cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
RUN cmake --build build

FROM gcr.io/distroless/cc-debian11
COPY --from=build /app/build/hello_world /hello_world
CMD ["/hello_world"]
`,
  template: (projectName: string) => ({
    files: {
      'CMakeLists.txt': `cmake_minimum_required(VERSION 3.10)
project(${projectName})

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(functions_framework_cpp REQUIRED)

add_executable(hello_world hello_world.cc)
target_link_libraries(hello_world functions-framework-cpp::framework)
`,
      'hello_world.cc': `#include <google/cloud/functions/function.h>

namespace gcf = ::google::cloud::functions;

gcf::Function HelloWorld() {
  return gcf::MakeFunction([](gcf::HttpRequest const& /*request*/) {
    return gcf::HttpResponse{}
        .set_header("Content-Type", "text/plain")
        .set_payload("Hello, World!\\n");
  });
}

int main(int argc, char* argv[]) {
  return gcf::Run(argc, argv, HelloWorld());
}
`,
      'vcpkg.json': JSON.stringify(
        {
          name: projectName,
          version: '1.0.0',
          dependencies: ['functions-framework-cpp'],
        },
        null,
        2,
      ),
    },
    postCreate: [],
  }),
})
