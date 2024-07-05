import { nanoid } from 'nanoid';

// 默认情况下，nanoid 会生成一个包含 21 个字符的 ID。为了减少占用空间，我们默认为 10 个字符。不过，我们发生碰撞的可能性更高

/**
 * 生成一个随机 ID。例如，该 ID 可以用作节点 ID。
 *
 * @param大小 为 ID 生成的字符数。 默认为“10”
 * @returns 随机 ID
 */
export const getRandomId = (size: number = 10) => nanoid(size);
