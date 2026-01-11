import { THEME } from "@/lib/theme";
import { CoreBridge, RichText, TenTapStartKit, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";

export const TentapEditor = () => {
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

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent,
    bridgeExtensions: [
        ...TenTapStartKit,
        CoreBridge.configureCSS(editorCss)
    ],
    theme: {
      webview: {
        backgroundColor: activeTheme.background,
      },
    },
  });

  useEffect(() => {
    editor.injectCSS(editorCss);
  }, [editor, editorCss]);

  return (
    // <SafeAreaView>
    <View className="flex-1 w-full text-foreground">
      <View className="flex-1 w-full p-4">
        <RichText editor={editor} />
      </View>
      <KeyboardAvoidingView
        behavior={"padding"}
        style={exampleStyles.keyboardAvoidingView}
        keyboardVerticalOffset={120}
      >
        <Toolbar editor={editor} />
        {/* <View className="w-10 h-10 bg-[#ff0000]" /> */}
      </KeyboardAvoidingView>
    </View>
    // </SafeAreaView>
  );
};

const exampleStyles = StyleSheet.create({
  keyboardAvoidingView: {
    position: "absolute",
    width: "100%",
    bottom: 20,
    zIndex: 10,
  },
});

const initialContent = `<p>
This is a basic example!
In this example we will implement darkmode in the editor. This is similar to setting up custom css.

Adding Dark Theme
To customize the native theme you can use the theme prop on useEditorBridge

If we simply want to add the existing dark mode theme you can just do

import { ..., darkEditorTheme } from '@10play/tentap-editor';
useEditorBridge({
   theme: darkEditorTheme
});

Now we just need to update the web-side css with extendCss

import { darkEditorTheme, darkEditorCss } from '@10play/tentap-editor';
useEditorBridge({
    ...
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(darkEditorCss), // <--- Add our dark mode css
    ],
    theme: darkEditorTheme, // <-- Add our dark mode theme
});
</p>`;
