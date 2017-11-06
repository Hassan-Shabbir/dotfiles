import XMonad

myKeys conf@(XConfig {XMonad.modMask = modm}) = M.fromList $
    [ ((modm .|. shiftMask, 0x1008FF11), spawn "exe=`amixer -D pulse sset Master 5%-`" )
    , ((modm .|. shiftMask, 0x1008FF13), spawn "exe=`amixer -D pulse sset Master 5%+`")
    --, ((modm .|. shiftMask, 0x1008FF12), spawn "exe=`amixer -D pulse sset Master toggle`")
    ]

main = xmonad def
    { terminal    = "xfce4-terminal"
    , borderWidth = 3
    , focusedBorderColor = "#268BD2"
    , keys = myKeys
    , modMask = mod3Mask
    }
