export interface YoutubePlayerPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
