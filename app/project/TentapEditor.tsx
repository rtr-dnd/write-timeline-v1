import { THEME } from "@/lib/theme";
import { EditorBridge, RichText, Toolbar } from "@10play/tentap-editor";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { KeyboardAvoidingView, View } from "react-native";

interface TentapEditorProps {
  editor: EditorBridge;
}

export const TentapEditor = ({ editor }: TentapEditorProps) => {
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const editorCss = `
    * {
      background-color: ${activeTheme.background};
      color: ${activeTheme.foreground};
    }
    p {
      line-height: 1.6;
      margin: 0.5rem 0;
    }
    blockquote {
      border-left: 3px solid ${activeTheme.input};
      padding-left: 1rem;
    }
  `;

  useEffect(() => {
    editor.injectCSS(editorCss);
  }, [editor, editorCss]);

  return (
    <View className="flex-1 w-full text-foreground">
      <View className="flex-1 w-full p-4">
        <RichText editor={editor} />
      </View>
      <KeyboardAvoidingView
        behavior={"padding"}
        className="absolute w-full bottom-[20] z-10"
        keyboardVerticalOffset={120}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
    </View>
  );
};