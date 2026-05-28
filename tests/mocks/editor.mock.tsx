import { useImperativeHandle } from "react";

const mockEditorMethods = {
  getMarkdown: jest.fn(() => ""),
  setMarkdown: jest.fn(),
  focus: jest.fn()
};

const MockEditor = jest.fn(({ markdown, ref, onChange, ...props }) => {
  useImperativeHandle(
    ref,
    () => ({
      setMarkdown: jest.fn((newMarkdown: string) => {
        if (onChange) onChange(newMarkdown);
      }),
      getMarkdown: jest.fn(() => markdown || "")
    }),
    [markdown, onChange]
  );
  return (
    <textarea
      id="mdx-editor"
      data-testid="mdx-editor"
      defaultValue={markdown}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    />
  );
});

export { mockEditorMethods, MockEditor };
