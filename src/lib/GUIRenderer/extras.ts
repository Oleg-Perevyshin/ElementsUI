/* src/lib/GUIRenderer/extras.ts - тяжёлые компоненты GUI (карта, пилотажный прибор, видео, джойстик): GUIRenderer получает их через extras, без них они не попадают в сборку приложения */
import Joystick from "../Joystick/Joystick.svelte"
import VideoViewer from "../VideoViewer/VideoViewer.svelte"
import WidgetPFD from "../WidgetPFD/WidgetPFD.svelte"
import WidgetMap from "../WidgetMap/WidgetMap.svelte"

export const GUI_EXTRAS = { Joystick, VideoViewer, WidgetPFD, WidgetMap }

/* Набор, который приложение передаёт в GUIRenderer: нужные из GUI_EXTRAS; тип без компонента рисуется заглушкой */
export type GuiExtras = Partial<typeof GUI_EXTRAS>
