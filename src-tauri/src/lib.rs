use tauri::{Manager, menu::{Menu, MenuItem, PredefinedMenuItem, Submenu, MenuItemKind}, AppHandle, Wry, MenuEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Build native menu
      let menu = build_menu(app)?;
      app.set_menu(menu)?;

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .on_menu_event(handle_menu_event)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn build_menu(app: &mut tauri::App) -> tauri::Result<Menu<Wry>> {
  let handle = app.handle();

  // File menu
  let new_chat = MenuItem::with_id(handle, "new_chat", "New Chat", true, Some("CmdOrCtrl+N"))?;
  let close = MenuItem::with_id(handle, "close", "Close Window", true, Some("CmdOrCtrl+W"))?;

  let mut file_menu_items = vec![
    &new_chat as &dyn MenuItemKind<Wry>,
    &PredefinedMenuItem::separator(handle)? as &dyn MenuItemKind<Wry>,
    &close as &dyn MenuItemKind<Wry>,
  ];

  #[cfg(not(target_os = "macos"))]
  {
    let quit = MenuItem::with_id(handle, "quit", "Quit", true, Some("CmdOrCtrl+Q"))?;
    file_menu_items.push(&quit as &dyn MenuItemKind<Wry>);
  }

  let file_menu = Submenu::with_items(handle, "File", true, &file_menu_items)?;

  // Edit menu
  let edit_menu = Submenu::with_items(
    handle,
    "Edit",
    true,
    &[
      &PredefinedMenuItem::undo(handle, None)? as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::redo(handle, None)? as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::separator(handle)? as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::cut(handle, None)? as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::copy(handle, None)? as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::paste(handle, None)? as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::select_all(handle, None)? as &dyn MenuItemKind<Wry>,
    ],
  )?;

  // View menu
  let clear_chat = MenuItem::with_id(handle, "clear_chat", "Clear Chat", true, Some("CmdOrCtrl+K"))?;
  let settings = MenuItem::with_id(handle, "settings", "Settings", true, Some("CmdOrCtrl+,"))?;
  let reload = MenuItem::with_id(handle, "reload", "Reload", true, Some("CmdOrCtrl+R"))?;
  let toggle_fullscreen = MenuItem::with_id(handle, "toggle_fullscreen", "Toggle Fullscreen", true, Some("F11"))?;

  let view_menu = Submenu::with_items(
    handle,
    "View",
    true,
    &[
      &clear_chat as &dyn MenuItemKind<Wry>,
      &settings as &dyn MenuItemKind<Wry>,
      &PredefinedMenuItem::separator(handle)? as &dyn MenuItemKind<Wry>,
      &reload as &dyn MenuItemKind<Wry>,
      &toggle_fullscreen as &dyn MenuItemKind<Wry>,
    ],
  )?;

  // Help menu
  let about = MenuItem::with_id(handle, "about", "About Cora AI", true, None::<&str>)?;
  let help_menu = Submenu::with_items(
    handle,
    "Help",
    true,
    &[&about as &dyn MenuItemKind<Wry>],
  )?;

  // Build main menu
  let mut menu_items: Vec<&dyn MenuItemKind<Wry>> = vec![
    &file_menu as &dyn MenuItemKind<Wry>,
    &edit_menu as &dyn MenuItemKind<Wry>,
    &view_menu as &dyn MenuItemKind<Wry>,
  ];

  // Add Window menu on macOS
  #[cfg(target_os = "macos")]
  {
    let window_menu = Submenu::with_items(
      handle,
      "Window",
      true,
      &[
        &PredefinedMenuItem::minimize(handle, None)? as &dyn MenuItemKind<Wry>,
        &PredefinedMenuItem::maximize(handle, None)? as &dyn MenuItemKind<Wry>,
        &PredefinedMenuItem::separator(handle)? as &dyn MenuItemKind<Wry>,
        &PredefinedMenuItem::close_window(handle, None)? as &dyn MenuItemKind<Wry>,
      ],
    )?;
    menu_items.push(&window_menu as &dyn MenuItemKind<Wry>);
  }

  menu_items.push(&help_menu as &dyn MenuItemKind<Wry>);

  Menu::with_items(handle, &menu_items)
}

fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
  let window = app.get_webview_window("main").unwrap();

  match event.id.as_ref() {
    "new_chat" => {
      // Emit event to frontend to create new chat
      window.emit("menu:new-chat", ()).unwrap();
    }
    "clear_chat" => {
      // Emit event to frontend to clear chat
      window.emit("menu:clear-chat", ()).unwrap();
    }
    "settings" => {
      // Emit event to frontend to open settings
      window.emit("menu:settings", ()).unwrap();
    }
    "reload" => {
      // Reload the window
      window.eval("location.reload()").unwrap();
    }
    "toggle_fullscreen" => {
      // Toggle fullscreen
      let is_fullscreen = window.is_fullscreen().unwrap();
      window.set_fullscreen(!is_fullscreen).unwrap();
    }
    "close" => {
      window.close().unwrap();
    }
    "quit" => {
      std::process::exit(0);
    }
    "about" => {
      // Emit event to frontend to show about dialog
      window.emit("menu:about", ()).unwrap();
    }
    _ => {}
  }
}
