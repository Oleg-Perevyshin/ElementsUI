# 📜 DroneCAN DSDL

Официальные описания типов DroneCAN (протокол CAN ArduPilot) без изменений, из github.com/dronecan/DSDL, коммит `b4653c7` от 2026-02-05. Лицензия MIT - файл `LICENSE` рядом.

Из этих файлов `scripts/GenerateDroneCAN.mjs` строит таблицу типов `src/lib/protocols/dronecan/generated/types.ts` (`npm run Generate`). Чтобы обновить набор, замените папки пространств имён новыми из официального репозитория, удалите в них `README.md` и запустите генерацию.
