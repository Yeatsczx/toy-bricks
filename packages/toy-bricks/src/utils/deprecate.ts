type DeprecationPayload = Partial<{
  suggest: string;
  doc: string;
}>;

export const deprecationWarning = (name, payload?: DeprecationPayload) => {
  let message = `弃用警告: ${name} 将被弃用.`;

  const { suggest, doc } = payload;

  if (suggest) {
    message += ` 请使用 ${suggest} 代替.`;
  }

  // 指向文档的 URL 链接
  if (doc) {
    message += `(${doc})`;
  }

  // eslint-disable-next-line no-console
  console.warn(message);
};
