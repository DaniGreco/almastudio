//! Installed fonts, for the terminal font picker in Settings.

use std::collections::BTreeSet;

/// Family names of every installed text font, deduplicated.
///
/// Which of them suit a terminal is decided by the frontend, by measuring
/// them in the webview: the fixed-pitch flag in a font's header is unreliable
/// (Courier and Monaco don't set it), and measuring also proves the webview
/// can actually render the family. Scanning parses every font file's header,
/// which takes a moment on a machine with many fonts — hence off the main
/// thread.
#[tauri::command]
pub async fn font_families() -> Vec<String> {
    tauri::async_runtime::spawn_blocking(|| {
        let mut db = fontdb::Database::new();
        db.load_system_fonts();
        let families: BTreeSet<String> = db
            .faces()
            .filter(|face| !is_symbol_font(&db, face.id))
            .filter_map(|face| face.families.first().map(|(name, _)| name.trim().to_string()))
            // Names starting with a dot are macOS-private system fonts that
            // applications can't ask for by name.
            .filter(|name| !name.is_empty() && !name.starts_with('.'))
            .collect();
        families.into_iter().collect()
    })
    .await
    .unwrap_or_default()
}

/// Whether a face maps letters to pictographs, as Wingdings does. Such fonts
/// can have uniformly wide glyphs and so pass for monospace, but nobody can
/// read a terminal in them. They declare it with a Windows "symbol" cmap.
fn is_symbol_font(db: &fontdb::Database, id: fontdb::ID) -> bool {
    const WINDOWS_SYMBOL_ENCODING_ID: u16 = 0;
    db.with_face_data(id, |data, index| {
        let Ok(face) = ttf_parser::Face::parse(data, index) else { return true };
        face.tables().cmap.is_some_and(|cmap| {
            cmap.subtables.into_iter().any(|sub| {
                sub.platform_id == ttf_parser::PlatformId::Windows
                    && sub.encoding_id == WINDOWS_SYMBOL_ENCODING_ID
            })
        })
    })
    .unwrap_or(true)
}
