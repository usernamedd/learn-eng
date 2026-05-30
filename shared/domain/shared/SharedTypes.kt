package shared.domain.shared

/**
 * 错误结果
 */
sealed class Result<out T, out E> {
    data class Ok<T>(val value: T) : Result<T, Nothing>()
    data class Err<E>(val error: E) : Result<Nothing, E>()

    fun isOk(): Boolean = this is Ok
    fun isErr(): Boolean = this is Err

    fun getOrNull(): T? = (this as? Ok)?.value
    fun errorOrNull(): E? = (this as? Err)?.error
}

/**
 * 生成唯一 ID
 */
fun newId(): String = java.util.UUID.randomUUID().toString()