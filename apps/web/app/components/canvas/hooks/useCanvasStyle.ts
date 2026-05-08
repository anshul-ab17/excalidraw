import { useEffect, useRef, useState } from "react";

export function useCanvasStyle() {
  const [strokeColor, setStrokeColor] = useState("#1e1e1e");
  const [bgColor, setBgColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [roughness, setRoughness] = useState(1);
  const [opacity, setOpacity] = useState(100);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('"Segoe UI", sans-serif');

  const strokeColorRef = useRef("#1e1e1e");
  const bgColorRef = useRef("transparent");
  const strokeWidthRef = useRef(2);
  const roughnessRef = useRef(1);
  const opacityRef = useRef(100);
  const fontSizeRef = useRef(24);
  const fontFamilyRef = useRef('"Segoe UI", sans-serif');

  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { roughnessRef.current = roughness; }, [roughness]);
  useEffect(() => { opacityRef.current = opacity; }, [opacity]);
  useEffect(() => { fontSizeRef.current = fontSize; }, [fontSize]);
  useEffect(() => { fontFamilyRef.current = fontFamily; }, [fontFamily]);

  return {
    strokeColor, setStrokeColor, strokeColorRef,
    bgColor, setBgColor, bgColorRef,
    strokeWidth, setStrokeWidth, strokeWidthRef,
    roughness, setRoughness, roughnessRef,
    opacity, setOpacity, opacityRef,
    fontSize, setFontSize, fontSizeRef,
    fontFamily, setFontFamily, fontFamilyRef,
  };
}
