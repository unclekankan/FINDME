/**
 * 音频预览工具
 * 1. iTunes Search API（多个地区尝试：US → JP → GB，30秒预览）
 * 2. 备用：嵌入式 YouTube 播放器
 */

/**
 * 尝试从 iTunes 搜索歌曲预览（多个地区商店）
 */
export async function fetchSongPreview(title, artist) {
  const youtubeId = await searchYouTube(title, artist)

  // 依次尝试不同地区的 iTunes 商店
  const countries = ['US', 'JP', 'GB']
  for (const country of countries) {
    try {
      const query = encodeURIComponent(`${title} ${artist}`)
      const res = await fetch(
        `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=5&country=${country}`
      )
      if (!res.ok) continue
      const data = await res.json()
      if (data.resultCount === 0) continue

      const withPreview = data.results.find((r) => r.previewUrl)
      if (withPreview) {
        return {
          previewUrl: withPreview.previewUrl,
          trackName: withPreview.trackName,
          artistName: withPreview.artistName,
          artworkUrl: withPreview.artworkUrl100?.replace('100x100', '300x300'),
          youtubeId,
          hasAudio: true,
        }
      }
    } catch {
      continue
    }
  }

  return {
    previewUrl: null,
    artworkUrl: null,
    youtubeId,
    hasAudio: false,
  }
}

/**
 * 搜索 YouTube 视频 ID（使用 YouTube 的 oembed 或直接搜索）
 */
async function searchYouTube(title, artist) {
  try {
    const query = encodeURIComponent(`${artist} ${title} official audio`)
    // 使用 YouTube no-embed search page 的公开接口
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${query}`
    )
    if (!res.ok) return null
    const html = await res.text()
    // 从 HTML 中提取第一个 videoId
    const match = html.match(/"videoId":"([^"]+)"/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
