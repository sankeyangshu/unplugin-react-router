/**
 * Plugin options
 */
interface Options {
  /**
   * Paths to the directory to search for page components.
   * @default 'src/pages'
   */
  dir: string;
}

export type UserOptions = Partial<Options>;
