/* Список модулей изделия CFG.ModList: каналы ModIFace - биты iface_t прошивок (common.h) */

/* Канал соседа по SSDP (IFACE_WEBSOCKET_LOCAL прошивки ESP): независимое устройство рядом в сети, его команды головной модуль не пересылает - в состав изделия (карусель модулей) не входит */
export const MOD_IFACE_NEIGHBOR = 1 << 16

/* Строка ModList - сосед по SSDP, а не модуль изделия */
export const isNeighborModule = (module: { ModIFace?: unknown }) => module.ModIFace === MOD_IFACE_NEIGHBOR
