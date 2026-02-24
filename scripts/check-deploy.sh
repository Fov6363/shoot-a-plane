#!/bin/bash
# 检查 Vercel 线上是否部署了最新代码

SITE_URL="https://shoot-a-plane.vercel.app"
LOCAL_HASH=$(git rev-parse --short HEAD)

echo "本地最新 commit: $LOCAL_HASH"
echo "检查线上: $SITE_URL"
echo ""

# 抓取线上 HTML 中的 commit meta 标签
REMOTE_HASH=$(curl -sL "$SITE_URL" | grep -oP 'meta name="commit" content="\K[^"]+')

if [ -z "$REMOTE_HASH" ]; then
  echo "❌ 线上未找到 commit 标记（可能还没部署带标记的版本）"
  exit 1
fi

echo "线上部署 commit: $REMOTE_HASH"
echo ""

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
  echo "✅ 线上已部署最新代码！"
  exit 0
else
  echo "⚠️  线上版本落后！"
  echo "   本地: $LOCAL_HASH"
  echo "   线上: $REMOTE_HASH"
  echo ""
  echo "落后的提交："
  git log --oneline "$REMOTE_HASH".."$LOCAL_HASH" 2>/dev/null || echo "   (无法比较，可能线上 commit 不在本地历史中)"
  exit 1
fi
