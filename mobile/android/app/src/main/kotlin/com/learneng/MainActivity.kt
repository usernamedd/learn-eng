package com.learneng

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ToggleButton
import android.widget.Spinner
import android.widget.TextView
import android.widget.Button
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.textview.MaterialTextView
import com.learneng.adapters.android.AndroidConfigRepository
import com.learneng.adapters.android.AndroidLlmAdapter
import com.learneng.adapters.android.AndroidTtsGateway
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import shared.domain.configuration.entities.Language
import shared.domain.configuration.services.ConfigDomainService
import shared.domain.conversation.entities.ChatHistory
import shared.domain.conversation.ports.inbound.ConversationService
import shared.domain.conversation.services.ConversationDomainService
import shared.domain.translation.ports.inbound.TranslationService
import shared.domain.translation.services.TranslationDomainService

/**
 * 主界面 Activity
 * 实现两种工作模式的切换和基本交互
 */
class MainActivity : AppCompatActivity() {

    private lateinit var modeToggle: ToggleButton
    private lateinit var languageSpinner: Spinner
    private lateinit var recordBtn: MaterialButton
    private lateinit var outputText: TextView
    private lateinit var statusText: MaterialTextView

    private var currentMode: Mode = Mode.TRANSLATE
    private lateinit var translationService: TranslationService
    private lateinit var conversationService: ConversationService

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    enum class Mode { TRANSLATE, CONVERSATION }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val audioGranted = permissions[Manifest.permission.RECORD_AUDIO] == true
        statusText.text = if (audioGranted) "录音权限已授予" else "需要录音权限才能使用"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupLanguageSpinner()
        checkPermissions()
        initServices()
    }

    private fun initViews() {
        modeToggle = findViewById(R.id.mode_toggle)
        languageSpinner = findViewById(R.id.language_spinner)
        recordBtn = findViewById(R.id.record_btn)
        outputText = findViewById(R.id.output_text)
        statusText = findViewById(R.id.status_text)

        modeToggle.setOnCheckedChangeListener { _, isChecked ->
            currentMode = if (isChecked) Mode.CONVERSATION else Mode.TRANSLATE
            updateModeLabel()
        }

        recordBtn.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
                return@setOnClickListener
            }
            startRecording()
        }
    }

    private fun setupLanguageSpinner() {
        val adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            Language.SUPPORTED.map { "${it.flag} ${it.name}" }
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        languageSpinner.adapter = adapter
    }

    private fun updateModeLabel() {
        val label = when (currentMode) {
            Mode.TRANSLATE -> "翻译模式"
            Mode.CONVERSATION -> "对话模式"
        }
        statusText.text = label
    }

    private fun checkPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
        }
    }

    private fun initServices() {
        val configRepo = AndroidConfigRepository(this)
        val configDomain = ConfigDomainService(configRepo)

        val provider = configDomain.getLlmProvider()
        val apiKey = configDomain.getLlmApiKey(provider) ?: ""
        val baseUrl = configDomain.getLlmBaseUrl(provider) ?: ""

        val llmAdapter = AndroidLlmAdapter(apiKey, baseUrl, provider)

        val translationDomain = TranslationDomainService(llmAdapter)
        translationService = translationDomain

        val conversationDomain = ConversationDomainService(llmAdapter, AndroidTtsGateway())
        conversationService = conversationDomain

        outputText.text = "服务初始化完成，当前模式：翻译"
    }

    private fun startRecording() {
        // TODO: 启动录音
        // 1. 录音
        // 2. STT 语音识别
        // 3. 根据当前模式调用 translationService 或 conversationService
        // 4. 显示结果，对话模式还要播放 TTS
        statusText.text = "录音功能待实现"
    }
}
