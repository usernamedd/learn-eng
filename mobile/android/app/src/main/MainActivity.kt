package platform.android

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.textview.MaterialTextView
import kotlinx.coroutines.launch
import shared.domain.entity.AppConfig
import shared.domain.entity.Language
import shared.ports.inbound.ConversationService
import shared.ports.inbound.TranslationService

/**
 * 主界面 Activity
 * 实现两种工作模式的切换和基本交互
 */
class MainActivity : AppCompatActivity() {

    private lateinit var modeToggle: android.widget.ToggleButton
    private lateinit var languageSpinner: android.widget.Spinner
    private lateinit var recordBtn: MaterialButton
    private lateinit var outputText: MaterialTextView
    private lateinit var statusText: MaterialTextView

    private var currentMode: Mode = Mode.TRANSLATE
    private lateinit var translationService: TranslationService
    private lateinit var conversationService: ConversationService

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
        // TODO: 注入实现（后续通过 DI 框架或手动注入）
        // 这里先 placeholder，后续在 Application 或 DI 模块中初始化
    }

    private fun startRecording() {
        // TODO: 启动录音
        // 1. 录音
        // 2. STT 语音识别
        // 3. 根据当前模式调用 translationService 或 conversationService
        // 4. 显示结果，对话模式还要播放 TTS
    }
}