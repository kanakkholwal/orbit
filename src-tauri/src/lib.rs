use std::{
    path::Path,
    sync::Mutex,
};

use tauri::{AppHandle, Emitter, Manager};

#[derive(Default)]
struct OpenedPdfPaths(Mutex<Vec<String>>);

#[tauri::command]
fn opened_pdf_paths(app: AppHandle) -> Vec<String> {
    let state = app.state::<OpenedPdfPaths>();
    let mut guard = state.0.lock().unwrap();
    std::mem::take(&mut *guard)
}

fn is_pdf_path(path: &str) -> bool {
    let candidate = Path::new(path);
    candidate.exists()
        && candidate.is_file()
        && candidate
            .extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case("pdf"))
}

fn collect_pdf_paths<I>(values: I) -> Vec<String>
where
    I: IntoIterator,
    I::Item: AsRef<str>,
{
    values
        .into_iter()
        .filter_map(|value| {
            let raw = value.as_ref().trim();
            if raw.is_empty() || raw.starts_with('-') || !is_pdf_path(raw) {
                None
            } else {
                Some(raw.to_string())
            }
        })
        .collect()
}

fn store_opened_pdf_paths(app: &AppHandle, paths: Vec<String>) {
    if paths.is_empty() {
        return;
    }

    {
        let state = app.state::<OpenedPdfPaths>();
        let mut guard = state.0.lock().unwrap();
        guard.extend(paths.clone());
    }

    let _ = app.emit("desktop-opened-pdfs", paths);

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub fn run() {
    let mut builder = tauri::Builder::default()
        .manage(OpenedPdfPaths::default())
        .invoke_handler(tauri::generate_handler![opened_pdf_paths])
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            let paths = collect_pdf_paths(args.iter().skip(1).map(|arg| arg.as_str()));
            store_opened_pdf_paths(app, paths);
        }));
    }

    builder
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(desktop)]
            {
                let paths = collect_pdf_paths(std::env::args().skip(1));
                store_opened_pdf_paths(&app.handle().clone(), paths);
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, _event| {
            #[cfg(any(target_os = "macos", target_os = "ios", target_os = "android"))]
            if let tauri::RunEvent::Opened { urls } = _event {
                let paths = collect_pdf_paths(
                    urls.iter()
                        .filter_map(|url| url.to_file_path().ok())
                        .map(|path| path.to_string_lossy().to_string()),
                );
                store_opened_pdf_paths(_app, paths);
            }
        });
}
