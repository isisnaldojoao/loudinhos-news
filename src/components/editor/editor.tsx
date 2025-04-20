"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";
import Image from "@tiptap/extension-image";
import EnterAsBreak from './EnterAsBreak' // caminho da extensão personalizada que funciona para adicionar espaços entre parágrafos quando apertar enter


type Props = {
  onChange: (value: string) => void;
  content?: string;
};

export default function Editor({ onChange, content }: Props) {
  const isInsertingImage = useRef(false); // <- Flag para evitar o onChange ao inserir imagem

  const editor = useEditor({
    extensions: [StarterKit, Underline, Image, EnterAsBreak],
    content: content || "",
    onUpdate({ editor }) {
      if (isInsertingImage.current) return;
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="space-y-4">
      {/* Botões */}
      <div className="bg-zinc-300 flex flex-wrap gap-2 border-rounded rounded-lg p-4">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "font-bold underline" : ""}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg "><strong>B</strong></a>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "italic" : ""}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg "><i>𝐼</i></a>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "underline" : ""}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg "><u>U</u></a>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "font-bold underline" : ""}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg ">Subtitulo</a>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg ">Lista</a>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg ">Citação</a>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <a className="hover:bg-zinc-500 p-2 border-rounded rounded-lg ">Limpar Formatação</a>
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt("Cole a URL da imagem:");
            if (url) {
              isInsertingImage.current = true;
              editor?.chain().focus().setImage({ src: url }).run();


              setTimeout(() => {
                const html = editor.getHTML();
                onChange(html);
                isInsertingImage.current = false;
              }, 100);
            }
          }}
          className="mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Inserir Imagem
        </button>
      </div>

      <EditorContent
  editor={editor}
  className="w-full p-2 border rounded min-h-[400px] 
    [&_.ProseMirror]:outline-none 
    [&_.ProseMirror]:whitespace-pre-wrap
    [&_.ProseMirror_p]:mb-4" // <== isso adiciona espaço entre parágrafos
/>


    </div>
  );
}
