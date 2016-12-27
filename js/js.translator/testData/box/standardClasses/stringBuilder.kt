package foo


fun box(): String {
    var q = "O"
    q += 'K'
    if (q != "OK") return "fail"

    val s = StringBuilder()
    s.append("a")
    s.append("b").append("c")
    s.append('d').append("e")

    if (s.toString() != "abcde") return s.toString()
    return "OK"
}