import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { AtomBox, Text } from '@pancakeswap/uikit'
import { formatPrice } from '@pancakeswap/utils/formatFractions'
import Slider, { SliderProps } from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useCallback, useMemo } from 'react'
import { useInverted } from 'state/infinity/shared'
import styled from 'styled-components'

const StyledSlider = styled(Slider)`
  padding-bottom: 24px;
  margin-bottom: 24px;

  .rc-slider-rail {
    background-color: ${({ theme, disabled }) => theme.colors[disabled ? 'textDisabled' : 'inputSecondary']};
    height: 2px;
    position: absolute;
    top: 10px;
    width: 100%;
  }

  .rc-slider-track {
    background-color: ${({ theme }) => theme.colors.primary};
    filter: ${({ disabled }) => (disabled ? 'grayscale(100%)' : 'none')};
    height: 10px;
  }

  .rc-slider-handle {
    -webkit-appearance: none;
    background-color: transparent;
    box-shadow: none;
    border: 0;
    cursor: pointer;
    width: 32px;
    height: 48px;
    filter: none;
    transition: 200ms transform;
    margin-top: -18px;
  }

  .rc-slider-handle-1 {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzc2ODdfNDEzKSI+CjxwYXRoIGQ9Ik0xNi42NzYgNDMuNzA0QzE2Ljk5MzMgNDMuNzA0IDE3LjI4MjcgNDMuNjI5MyAxNy41NDQgNDMuNDhDMTcuODA1MyA0My4zMjEzIDE4LjAxNTMgNDMuMTExMyAxOC4xNzQgNDIuODVDMTguMzIzMyA0Mi41ODg3IDE4LjM5OCA0Mi4yOTkzIDE4LjM5OCA0MS45ODJDMTguMzk4IDQxLjY2NDcgMTguMzIzMyA0MS4zNzUzIDE4LjE3NCA0MS4xMTRDMTguMDE1MyA0MC44NTI3IDE3LjgwNTMgNDAuNjQyNyAxNy41NDQgNDAuNDg0QzE3LjI4MjcgNDAuMzI1MyAxNi45OTMzIDQwLjI0NiAxNi42NzYgNDAuMjQ2QzE2LjM0OTMgNDAuMjQ2IDE2LjA1NTMgNDAuMzI1MyAxNS43OTQgNDAuNDg0QzE1LjUzMjcgNDAuNjQyNyAxNS4zMjczIDQwLjg1MjcgMTUuMTc4IDQxLjExNEMxNS4wMTkzIDQxLjM3NTMgMTQuOTQgNDEuNjY0NyAxNC45NCA0MS45ODJDMTQuOTQgNDIuMjk5MyAxNS4wMTkzIDQyLjU4ODcgMTUuMTc4IDQyLjg1QzE1LjMyNzMgNDMuMTExMyAxNS41MzI3IDQzLjMyMTMgMTUuNzk0IDQzLjQ4QzE2LjA1NTMgNDMuNjI5MyAxNi4zNDkzIDQzLjcwNCAxNi42NzYgNDMuNzA0WiIgZmlsbD0iI0Q3Q0FFQyIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI4LjUgMThIMTEuNVYyMS4yNDg5QzEwLjQ2ODMgMjEuNTY5NCA5LjQxMjY2IDIyLjE4OTkgOC41NDkwNyAyMy4wNTM1QzYuNTMxNDcgMjUuMDcxMSA1Ljg0MDkyIDI4LjEzNjggNy4yMDE1NiAyOS40OTc0QzguMzg3NDIgMzAuNjgzMyAxMC4xODQgMjkuNjI2NyAxMS45NjE2IDI4SDEyLjc0OTRDMTIuMzIwNSAyOS4zNzg3IDEyLjQyNzQgMzAuNzE1IDEzLjIwNTYgMzEuNDkzM0MxNC41NjU2IDMyLjg1MzIgMTYuNzI5MiAzMS4yNjI0IDE4Ljc0NTggMjkuMjQ1OEMxOS4xNTc2IDI4LjgzNCAxOS41NTE3IDI4LjQxNiAxOS45MDY1IDI4SDI4LjVWMThaIiBmaWxsPSIjMUZDN0Q0Ii8+CjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIwX2RfNzY4N180MTMpIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNi43MzA2IDUuNjM0MjFDMTYuNjU0MyA2LjAyNjY0IDE2LjU4NDIgNi40Mzc1IDE2LjUxNjQgNi44NTcxNkMxNi44ODQ5IDYuODU3NjYgMTcuMjUxOCA2Ljg3NTIyIDE3LjYxNjEgNi45MDg5NUMxNy44OTcxIDYuMjk0NjQgMTguMjMwNiA1LjY3MTk5IDE4LjYxNTYgNS4wNTI3N0MyMS4xMDM5IDEuMDUwNzkgMjMuNDM4IDAuOTAxMDk2IDI1LjUxMTQgMi4wMTI2NUMyNy41ODQ4IDMuMTI0MjEgMjcuNjg5MyA1Ljg5NTk3IDI1LjIxNyA4LjU5MTg4QzI0LjkyOTUgOC45MDU0MSAyNC42Mzc1IDkuMjM4NDEgMjQuMzQyNiA5LjU4MDM2QzI2LjgzOTcgMTEuNTE1NiAyOC41IDE0LjI5MSAyOC41IDE3LjI2OTVDMjguNSAyMi44MjkyIDIyLjcxNDggMjQgMTYuNSAyNEMxMC4yODUyIDI0IDQuNSAyMi44MjkyIDQuNSAxNy4yNjk1QzQuNSAxMy44NDg4IDYuNjg5OSAxMC42OTU4IDkuODIyNDIgOC43NzYwMkM5LjYxNDggNy44MTAyMiA5LjUgNi43NDg1NiA5LjUgNS42MzQyMUM5LjUgMS4xNzE3MSAxMS4zNDEgMCAxMy42MTIgMEMxNS44ODI5IDAgMTcuMzg0NSAyLjI3MTE2IDE2LjczMDYgNS42MzQyMVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl83Njg3XzQxMykiLz4KPC9nPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE5LjUgMTQuNUMxOS41IDE1LjYwNDYgMTkuOTQ3NyAxNiAyMC41IDE2QzIxLjA1MjMgMTYgMjEuNSAxNS42MDQ2IDIxLjUgMTQuNUMyMS41IDEzLjM5NTQgMjEuMDUyMyAxMyAyMC41IDEzQzE5Ljk0NzcgMTMgMTkuNSAxMy4zOTU0IDE5LjUgMTQuNVpNMTUuNzYzIDE1Ljk0NDZDMTUuNzc4NiAxNS45NDQ0IDE1Ljc5NDQgMTUuOTQ0OCAxNS44MTAzIDE1Ljk0NjFDMTYuMDg1NiAxNS45Njc1IDE2LjI5MTUgMTYuMjA4IDE2LjI3MDEgMTYuNDgzM0MxNi4yNDE4IDE2Ljg0NzUgMTYuMzA1NSAxNy4zODk4IDE2LjU2MTUgMTcuODIxM0MxNi43OTY4IDE4LjIxOCAxNy4yMTA0IDE4LjU1NTYgMTguMDAyIDE4LjU1NTZDMTguMjc4MSAxOC41NTU2IDE4LjUwMiAxOC43Nzk1IDE4LjUwMiAxOS4wNTU2QzE4LjUwMiAxOS4zMzE3IDE4LjI3ODEgMTkuNTU1NiAxOC4wMDIgMTkuNTU1NkMxNi45MDI2IDE5LjU1NTYgMTYuMTgzNCAxOS4wNzI5IDE1Ljc2MyAxOC40MzAzQzE1LjM0MjYgMTkuMDcyOSAxNC42MjMzIDE5LjU1NTYgMTMuNTI0IDE5LjU1NTZDMTMuMjQ3OSAxOS41NTU2IDEzLjAyNCAxOS4zMzE3IDEzLjAyNCAxOS4wNTU2QzEzLjAyNCAxOC43Nzk1IDEzLjI0NzkgMTguNTU1NiAxMy41MjQgMTguNTU1NkMxNC4zMTU2IDE4LjU1NTYgMTQuNzI5MiAxOC4yMTggMTQuOTY0NSAxNy44MjEzQzE1LjIyMDUgMTcuMzg5OCAxNS4yODQyIDE2Ljg0NzUgMTUuMjU1OSAxNi40ODMzQzE1LjIzNDUgMTYuMjA4IDE1LjQ0MDQgMTUuOTY3NSAxNS43MTU3IDE1Ljk0NjFDMTUuNzMxNiAxNS45NDQ4IDE1Ljc0NzQgMTUuOTQ0NCAxNS43NjMgMTUuOTQ0NlpNMTEuNSAxNkMxMC45NDc3IDE2IDEwLjUgMTUuNjA0NiAxMC41IDE0LjVDMTAuNSAxMy4zOTU0IDEwLjk0NzcgMTMgMTEuNSAxM0MxMi4wNTIzIDEzIDEyLjUgMTMuMzk1NCAxMi41IDE0LjVDMTIuNSAxNS42MDQ2IDEyLjA1MjMgMTYgMTEuNSAxNloiIGZpbGw9ImJsYWNrIi8+CjwvZz4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImZpbHRlcjBfZF83Njg3XzQxMyIgeD0iMi41IiB5PSItMS41IiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+CjxmZU9mZnNldCBkeT0iMC41Ii8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEiLz4KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuNSAwIi8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93Xzc2ODdfNDEzIi8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93Xzc2ODdfNDEzIiByZXN1bHQ9InNoYXBlIi8+CjwvZmlsdGVyPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfNzY4N180MTMiIHgxPSIxNi41IiB5MT0iMCIgeDI9IjE2LjUiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNTNERUU5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzFGQzdENCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzc2ODdfNDEzIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQ4IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzIgMCkiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K');
  }

  .rc-slider-handle-2 {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzMiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMyA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzc2ODdfNDMxKSI+CjxwYXRoIGQ9Ik0xNS44MjQgNDMuNzA0QzE1LjUwNjcgNDMuNzA0IDE1LjIxNzMgNDMuNjI5MyAxNC45NTYgNDMuNDhDMTQuNjk0NyA0My4zMjEzIDE0LjQ4NDcgNDMuMTExMyAxNC4zMjYgNDIuODVDMTQuMTc2NyA0Mi41ODg3IDE0LjEwMiA0Mi4yOTkzIDE0LjEwMiA0MS45ODJDMTQuMTAyIDQxLjY2NDcgMTQuMTc2NyA0MS4zNzUzIDE0LjMyNiA0MS4xMTRDMTQuNDg0NyA0MC44NTI3IDE0LjY5NDcgNDAuNjQyNyAxNC45NTYgNDAuNDg0QzE1LjIxNzMgNDAuMzI1MyAxNS41MDY3IDQwLjI0NiAxNS44MjQgNDAuMjQ2QzE2LjE1MDcgNDAuMjQ2IDE2LjQ0NDcgNDAuMzI1MyAxNi43MDYgNDAuNDg0QzE2Ljk2NzMgNDAuNjQyNyAxNy4xNzI3IDQwLjg1MjcgMTcuMzIyIDQxLjExNEMxNy40ODA3IDQxLjM3NTMgMTcuNTYgNDEuNjY0NyAxNy41NiA0MS45ODJDMTcuNTYgNDIuMjk5MyAxNy40ODA3IDQyLjU4ODcgMTcuMzIyIDQyLjg1QzE3LjE3MjcgNDMuMTExMyAxNi45NjczIDQzLjMyMTMgMTYuNzA2IDQzLjQ4QzE2LjQ0NDcgNDMuNjI5MyAxNi4xNTA3IDQzLjcwNCAxNS44MjQgNDMuNzA0WiIgZmlsbD0iI0Q3Q0FFQyIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQgMThIMjFWMjEuMjQ4OUMyMi4wMzE3IDIxLjU2OTQgMjMuMDg3MyAyMi4xODk5IDIzLjk1MDkgMjMuMDUzNUMyNS45Njg1IDI1LjA3MTEgMjYuNjU5MSAyOC4xMzY4IDI1LjI5ODQgMjkuNDk3NEMyNC4xMTI2IDMwLjY4MzMgMjIuMzE2IDI5LjYyNjcgMjAuNTM4NCAyOEgxOS43NTA2QzIwLjE3OTUgMjkuMzc4NyAyMC4wNzI2IDMwLjcxNSAxOS4yOTQ0IDMxLjQ5MzNDMTcuOTM0NCAzMi44NTMyIDE1Ljc3MDggMzEuMjYyNCAxMy43NTQyIDI5LjI0NThDMTMuMzQyNCAyOC44MzQgMTIuOTQ4MyAyOC40MTYgMTIuNTkzNSAyOEg0VjE4WiIgZmlsbD0iIzFGQzdENCIvPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9kXzc2ODdfNDMxKSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTUuNzY5NCA1LjYzNDIxQzE1Ljg0NTcgNi4wMjY2NCAxNS45MTU4IDYuNDM3NSAxNS45ODM2IDYuODU3MTZDMTUuNjE1MSA2Ljg1NzY2IDE1LjI0ODIgNi44NzUyMiAxNC44ODM5IDYuOTA4OTVDMTQuNjAyOSA2LjI5NDY0IDE0LjI2OTQgNS42NzE5OSAxMy44ODQ0IDUuMDUyNzdDMTEuMzk2MSAxLjA1MDc5IDkuMDYxOTkgMC45MDEwOTYgNi45ODg2MSAyLjAxMjY1QzQuOTE1MjQgMy4xMjQyMSA0LjgxMDY4IDUuODk1OTcgNy4yODI5NyA4LjU5MTg4QzcuNTcwNDkgOC45MDU0MSA3Ljg2MjU0IDkuMjM4NDEgOC4xNTc0NCA5LjU4MDM2QzUuNjYwMjcgMTEuNTE1NiA0IDE0LjI5MSA0IDE3LjI2OTVDNCAyMi44MjkyIDkuNzg1MTggMjQgMTYgMjRDMjIuMjE0OCAyNCAyOCAyMi44MjkyIDI4IDE3LjI2OTVDMjggMTMuODQ4OCAyNS44MTAxIDEwLjY5NTggMjIuNjc3NiA4Ljc3NjAyQzIyLjg4NTIgNy44MTAyMiAyMyA2Ljc0ODU2IDIzIDUuNjM0MjFDMjMgMS4xNzE3MSAyMS4xNTkgMCAxOC44ODggMEMxNi42MTcxIDAgMTUuMTE1NSAyLjI3MTE2IDE1Ljc2OTQgNS42MzQyMVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl83Njg3XzQzMSkiLz4KPC9nPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEzIDE0LjVDMTMgMTUuNjA0NiAxMi41NTIzIDE2IDEyIDE2QzExLjQ0NzcgMTYgMTEgMTUuNjA0NiAxMSAxNC41QzExIDEzLjM5NTQgMTEuNDQ3NyAxMyAxMiAxM0MxMi41NTIzIDEzIDEzIDEzLjM5NTQgMTMgMTQuNVpNMTYuNzM3IDE1Ljk0NDZDMTYuNzIxNCAxNS45NDQ0IDE2LjcwNTYgMTUuOTQ0OCAxNi42ODk3IDE1Ljk0NjFDMTYuNDE0NCAxNS45Njc1IDE2LjIwODUgMTYuMjA4IDE2LjIyOTkgMTYuNDgzM0MxNi4yNTgyIDE2Ljg0NzUgMTYuMTk0NSAxNy4zODk4IDE1LjkzODUgMTcuODIxM0MxNS43MDMyIDE4LjIxOCAxNS4yODk2IDE4LjU1NTYgMTQuNDk4IDE4LjU1NTZDMTQuMjIxOSAxOC41NTU2IDEzLjk5OCAxOC43Nzk1IDEzLjk5OCAxOS4wNTU2QzEzLjk5OCAxOS4zMzE3IDE0LjIyMTkgMTkuNTU1NiAxNC40OTggMTkuNTU1NkMxNS41OTc0IDE5LjU1NTYgMTYuMzE2NiAxOS4wNzI5IDE2LjczNyAxOC40MzAzQzE3LjE1NzQgMTkuMDcyOSAxNy44NzY3IDE5LjU1NTYgMTguOTc2IDE5LjU1NTZDMTkuMjUyMSAxOS41NTU2IDE5LjQ3NiAxOS4zMzE3IDE5LjQ3NiAxOS4wNTU2QzE5LjQ3NiAxOC43Nzk1IDE5LjI1MjEgMTguNTU1NiAxOC45NzYgMTguNTU1NkMxOC4xODQ0IDE4LjU1NTYgMTcuNzcwOCAxOC4yMTggMTcuNTM1NSAxNy44MjEzQzE3LjI3OTUgMTcuMzg5OCAxNy4yMTU4IDE2Ljg0NzUgMTcuMjQ0MSAxNi40ODMzQzE3LjI2NTUgMTYuMjA4IDE3LjA1OTYgMTUuOTY3NSAxNi43ODQzIDE1Ljk0NjFDMTYuNzY4NCAxNS45NDQ4IDE2Ljc1MjYgMTUuOTQ0NCAxNi43MzcgMTUuOTQ0NlpNMjEgMTZDMjEuNTUyMyAxNiAyMiAxNS42MDQ2IDIyIDE0LjVDMjIgMTMuMzk1NCAyMS41NTIzIDEzIDIxIDEzQzIwLjQ0NzcgMTMgMjAgMTMuMzk1NCAyMCAxNC41QzIwIDE1LjYwNDYgMjAuNDQ3NyAxNiAyMSAxNloiIGZpbGw9ImJsYWNrIi8+CjwvZz4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImZpbHRlcjBfZF83Njg3XzQzMSIgeD0iMiIgeT0iLTEuNSIgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPgo8ZmVPZmZzZXQgZHk9IjAuNSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxIi8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjUgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd183Njg3XzQzMSIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvd183Njg3XzQzMSIgcmVzdWx0PSJzaGFwZSIvPgo8L2ZpbHRlcj4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzc2ODdfNDMxIiB4MT0iMTYiIHkxPSIwIiB4Mj0iMTYiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNTNERUU5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzFGQzdENCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzc2ODdfNDMxIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQ4IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC41KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=');
  }
`

const Middle = styled.div`
  height: 24px;
  width: 2px;
  min-width: 2px;
  max-width: 2px;
  background-color: ${({ theme }) => theme.colors.textSubtle};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 5px;
  margin-left: -1px;
`

const MiddleTooltip = styled.div`
  background-color: ${({ theme }) => theme.colors.textSubtle};
  padding: 16px;
  font-size: 16px;
  line-height: 130%;
  border-radius: 16px;
  max-width: 320px;
  z-index: 101;
  color: ${({ theme }) => theme.colors.white};
  margin: 0 auto;
  position: relative;
  margin-bottom: 16px;

  &::before {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    z-index: -1;
    content: '';
    transform: translateX(-50%) rotate(45deg);
    background: ${({ theme }) => theme.colors.textSubtle};
    bottom: -4px;
    left: 50%;
  }
`

export const BinRangeSliderInner: React.FC<SliderProps> = (props) => {
  return <StyledSlider range {...props} />
}

type BinRangeSliderProps = SliderProps & {
  activePrice: Price<Currency, Currency> | undefined | null
  min: number
  max: number
}

export const BinRangeSlider: React.FC<BinRangeSliderProps> = ({
  activePrice,
  min,
  max,
  value,
  defaultValue,
  onChange,
  ...props
}) => {
  const { t } = useTranslation()
  const [inverted] = useInverted()
  const min_ = useMemo(() => (inverted ? -max : min), [inverted, min, max])
  const max_ = useMemo(() => (inverted ? -min : max), [inverted, min, max])
  const value_ = useMemo(() => {
    if (!value) return value
    return inverted ? [-value[1], -value[0]] : value
  }, [inverted, value])
  const defaultValue_ = useMemo(() => {
    if (!defaultValue) return defaultValue
    return inverted ? [-defaultValue[1], -defaultValue[0]] : defaultValue
  }, [inverted, defaultValue])

  const onChange_ = useCallback(
    (newValue: number | number[]) => {
      const [minV, maxV] = Array.isArray(newValue) ? newValue : [newValue, newValue]
      if (!onChange) return
      onChange(inverted ? [-maxV, -minV] : [minV, maxV])
    },
    [inverted, onChange],
  )

  if (!activePrice) return null

  return (
    <AtomBox style={{ position: 'relative' }}>
      <MiddleTooltip>
        <Text bold color="white" as="span">
          {t('Active Bin: %price%', { price: activePrice.denominator ? formatPrice(activePrice, 8) : '0' })}
        </Text>
        <Text color="white" as="span" ml={1}>
          {t('%base% per %quote%', { base: activePrice.quoteCurrency.symbol, quote: activePrice.baseCurrency.symbol })}
        </Text>
      </MiddleTooltip>
      <Middle>&nbsp;</Middle>
      <BinRangeSliderInner
        min={min_}
        max={max_}
        value={value_}
        defaultValue={defaultValue_}
        onChange={onChange_}
        {...props}
      />
    </AtomBox>
  )
}
