## Created with Capacitor Create App

This app was created using [`@capacitor/create-app`](https://github.com/ionic-team/create-capacitor-app),
and comes with a very minimal shell for building an app.

### Running this example

From the plugin repo root:

```bash
bun install --frozen-lockfile
bun run build
cd example-app
bun install --frozen-lockfile
bun run build
bunx cap sync ios
```

Open `example-app/ios/App/App.xcodeproj` in Xcode for the iOS simulator.

### Maestro (Native UI projection)

From `example-app/` on a booted iOS simulator with the app installed (`bunx cap run ios` or Run in Xcode):

| Flow | `nativeUIProjection` toggle |
| --- | --- |
| `.maestro/engine-projection-off.yaml` | OFF |
| `.maestro/engine-projection-off-failure.yaml` | OFF (overlay must not appear) |
| `.maestro/engine-projection-on-overlay.yaml` | ON |
| `.maestro/engine-projection-on-failure.yaml` | ON (destroy while overlay open) |

```bash
maestro test .maestro/engine-projection-off.yaml
maestro test .maestro/engine-projection-off-failure.yaml
maestro test .maestro/engine-projection-on-overlay.yaml
maestro test .maestro/engine-projection-on-failure.yaml
```

Web dev server only:

```bash
bun start
```
