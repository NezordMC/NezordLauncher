# Nezord Launcher

<div align="center">
  <!-- <img src="build/appicon.png" alt="Nezord Launcher Logo" width="128" height="128" /> -->
  <h1>Nezord Launcher</h1>
  <p>
    <strong>Modern. Lightweight. Stylish.</strong>
  </p>
  <p>
    A next-generation custom Minecraft Launcher built for performance and aesthetics.
  </p>
  
  <p>
    <a href="https://github.com/NezordMC/NezordLauncher/releases">
      <img src="https://img.shields.io/github/v/release/NezordMC/NezordLauncher?style=flat-square&color=0078D6" alt="Latest Release" />
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
    </a>
    <a href="#">
       <img src="https://img.shields.io/badge/Platform-Linux-00ADD8?style=flat-square" alt="Platform" />
    </a>
  </p>
</div>

---

## About

Nezord Launcher redefines your Minecraft experience. Designed to be a drop-in replacement for the official launcher and other third-party alternatives, it combines powerful instance management with a stunning, modern dark-mode interface.

Whether you are a casual player wanting skins to work offline, or a power user needing isolated instances for different modpacks, Nezord Launcher puts you in control.

## Key Features

- **High Performance**: Lightweight and fast, built with Go and Wails.
- **Secure Authentication**: Supports Ely.by for offline skins.
- **Auto-Updater**: Built-in update checker to ensure you're always on the latest version.
- **Instance Management**: Create and manage isolated Minecraft instances with their own mods and configs.
- **Mod Loader Support**: Built-in support for **Fabric** and **Quilt**.
- **Java Management**: Automatically detects Java installations (including `/opt` on Linux) for optimal performance.
- **Offline Mode**: Full support for offline accounts with skin fixes.
<!-- - **Cross-Platform**: Native support for **Linux** and **Windows**. -->

<!-- ## Screenshots

|                             Welcome Screen                             |                              Java Setup                               |
| :--------------------------------------------------------------------: | :-------------------------------------------------------------------: |
| <img src="screenshots/welcome.png" alt="Welcome Screen" width="400" /> | <img src="screenshots/java-setup.png" alt="Java Setup" width="400" /> |

_(More screenshots coming soon)_ -->

## Installation

### Linux

- **AppImage**: Download the `.AppImage` from the [Releases](https://github.com/NezordMC/NezordLauncher/releases), make it executable (`chmod +x`), and run.
- **Debian/RPM**: Install using your package manager if available.

<!-- ### Windows

- **Installer**: Download and run the `.exe` installer from the [Releases](https://github.com/NezordMC/NezordLauncher/releases). -->

## Development

If you want to contribute or build from source, follow these steps.

### Prerequisites

- **Go**: v1.21+
- **Node.js**: v20+
- **Wails**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- **PNPM**: `npm install -g pnpm`

### Setup & Build

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/NezordMC/NezordLauncher.git
    cd NezordLauncher
    ```

2.  **Install frontend dependencies**:

    ```bash
    cd frontend
    pnpm install
    cd ..
    ```

3.  **Run in Development Mode**:

    ```bash
    wails dev
    ```

    This starts a watcher for both Go and frontend files.

4.  **Build Production Binary**:

    ```bash
    wails build
    ```

    Output will be in `build/bin/`.

5.  **Build AppImage (Linux)**:
    ```bash
    ./build/linux/build-appimage.sh
    ```

### Running Tests

To ensure core logic works correctly, run the Go tests:

```bash
go test ./pkg/...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <small>© 2026 Nezord Launcher Project</small>
</div>
