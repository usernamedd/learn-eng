package com.learneng.adapters.android

import shared.domain.conversation.ports.outbound.TtsGateway

/**
 * Android TTS 适配器（placeholder）
 * TODO: 实现真正的 TTS
 */
class AndroidTtsGateway : TtsGateway {
    override val provider: String = "system"

    override suspend fun speak(text: String, language: String): ByteArray {
        // TODO: 实现真正的 TTS
        // 目前返回空数组，上层会 catch 异常
        return ByteArray(0)
    }
}
