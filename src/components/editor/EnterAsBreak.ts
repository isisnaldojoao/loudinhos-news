import { Extension } from '@tiptap/core'  // Importa a classe base para criar extensões personalizadas no Tiptap

// Criação de uma nova extensão chamada "enterAsBreak"
const EnterAsBreak = Extension.create({
  name: 'enterAsBreak',

 // Define atalhos de teclado personalizados
  addKeyboardShortcuts() {
    return {

    // Substitui o comportamento padrão da tecla Enter
      Enter: () => {
        // Substitui o comportamento padrão da tecla enter, adicionando uma quebra de linha
        // Ao invés de adicionar o compartamento de um parágrafo
        this.editor.commands.first(({ commands }) => [
          () => commands.insertContent('<br>'), 
          () => commands.insertContent('<br>'),
          // quantidade de espaços que ele vai gerar sempre que eu der um enter nesse caso vai ser 2x
        ])
        return true // quantidade de espaços que ele vai gerar sempre que eu der um enter
      },
    }
  },
})

export default EnterAsBreak
