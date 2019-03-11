export function editorAction(name, args) {
  return {
    type: 'EDITORACTION',
    name,
    args,
  };
}
