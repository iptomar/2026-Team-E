# FrontEnd

Para o frontend interativo (o construtor), a stack ideal dentro do React seria:

1. **Motor Drag-and-Drop:** `@dnd-kit`
    
2. **Sistema de Estilos:** `Tailwind CSS`
    
3. **Gestão de Estado (UI):** `Zustand`
    
4. **Gestão de Formulários (Propriedades):** `React Hook Form`

# A Lógica do Canvas Central: O "Sortable" Container

O canvas central não é apenas uma área "vazia". No `@dnd-kit`, chamamos-lhe um **Sortable Container** (Contentor Ordenável). A sua principal responsabilidade é gerir uma **lista ordenada de componentes**.

A lógica pode ser dividida em três pilares: o **Estado (State)**, os **Componentes Visuais** e os **Eventos de Interação**.

## 1. O Pilar do Estado (Zustand)

O canvas central é uma representação visual de um array de objetos no estado da tua aplicação.

**Por que é que isto é importante?** Quando o utilizador arrasta um componente, `@dnd-kit` não move o elemento HTML "na mão". Em vez disso, `@dnd-kit` calcula a nova posição pretendida e nós usamos a função `reorderFields` para atualizar o array no `Zustand`. O React então re-renderiza o canvas com base na nova ordem do array. Isto garante desempenho e consistência de dados.

# 2. Os Componentes Visuais (O que o utilizador vê)

A interface do canvas central é composta por três elementos principais envolvidos na lógica DnD:

## A. O Wrapper do Canvas (`DndContext` + `SortableContext`)

É o contentor "pai" que engloba toda a área central (o meio da ecrã).

- **A lógica:** Ele escuta os eventos do rato/toque e fornece o contexto necessário para que os componentes lá dentro saibam que podem ser ordenados. O `SortableContext` precisa de receber a lista de IDs atualizada do Estado (`formFields.map(f => f.id)`) para saber quais itens gerir.

## B. O Item Sortable (O "Campo do Formulário" no Canvas)

Cada campo que foi largado no canvas (Nome, Idade, etc.) precisa de ser envolto no hook `useSortable` do `@dnd-kit`.

- **A lógica:** Este hook transforma o componente visual (um input, um dropdown) num elemento "arrastável" e numa "zona de largada" ao mesmo tempo. Ele deteta quando outro item está a passar por cima dele e fornece os estilos de transição (animação) que fazem os outros itens "desviarem-se" para abrir espaço.
    

## C. O "Drag Handle" (A pega para arrastar)

Para uma melhor UX, não deves permitir que o utilizador arraste o componente clicando em qualquer lugar (como dentro do input). Deves criar uma pequena área (geralmente um ícone de 6 pontos `:::`) que serve como "pega".

- **A lógica:** Apenas esta área recebe os ouvintes de eventos de arrasto (`...attributes`, `...listeners` do hook `useSortable`). Isto permite que o utilizador interaja com os inputs normalmente (clicar para escrever) e use a pega para mover o componente.
    

# 3. A Lógica de Interação: O Fluxo de Reordenação

1. **Início do Arrasto (`onDragStart`):**
    
    - O utilizador clica na "pega" de um campo (ex: "Idade", `id: item-2`).
        
    - `@dnd-kit` fires o evento `onDragStart`.
        
    - O teu estado no Zustand pode marcar este item como "ativo" para aplicar estilos visuais (ex: aumentar a sombra, torná-lo semi-transparente).
        
2. **Durante o Movimento (`onDragOver`):**
    
    - O utilizador move o rato enquanto segura o clique.
        
    - `@dnd-kit` usa algoritmos de deteção de colisão (ex: `closestCenter`) para calcular sobre qual outro item o item ativo está a pairar.
        
    - **A "Mágica" Visual:** Se o item "Idade" passar por cima do item "Nome", o `@dnd-kit` automaticamente aplica transformações CSS (animações de deslize) aos itens vizinhos, visualmente criando um espaço vazio onde o item ativo seria largado. O utilizador vê os componentes a "dançarem" para abrir espaço.
        
3. **Fim do Arrasto (`onDragEnd`):**
    
    - O utilizador larga o botão do rato.
        
    - `@dnd-kit` fires o evento `onDragEnd` e fornece duas informações cruciais: o `active` ID (o item que foi arrastado) e o `over` ID (o item sobre o qual ele foi largado).
        
    - **Atualização do Estado (A parte crucial):** O teu handler `onDragEnd` no React chama a função do Zustand: `reorderFields(active.id, over.id)`.
        
    - O array no Zustand é atualizado (as posições são trocadas). O React detecta a mudança e re-renderiza o canvas. Os componentes aparecem agora na ordem final e as animações param.


