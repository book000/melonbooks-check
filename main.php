<?php

function sendDiscordWebhook($message)
{
    global $discordWebhookUrl;
    $data = [
        "content" => $message
    ];
    $header = array(
        "Content-Type: application/json",
        "Content-Length: ".strlen(json_encode($data)),
        "User-Agent: DiscordBot (http://example.com, v0.0.1)"
    );
    $context = array(
        "http" => array(
            "method"  => "POST",
            "header"  => implode("\r\n", $header),
            "content" => json_encode($data)
        )
    );
    $context = stream_context_create($context);
    echo file_get_contents($discordWebhookUrl, false, $context);
}

function crawler($item_id)
{
    $old_stock = null;
    if (!file_exists("/data/targets/")) {
        mkdir("/data/targets/", 0777, true);
    }
    if (file_exists("/data/targets/" . $item_id . ".txt")) {
        $old_stock = file_get_contents("/data/targets/" . $item_id . ".txt");
    }

    $html = file_get_contents("https://www.melonbooks.co.jp/detail/detail.php?product_id=" . $item_id . "&adult_view=1");
    $dom = new DOMDocument();
    @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
    $xpath = new DOMXPath($dom);
    $title_nodes = $xpath->query("//h1[@class='page-header']");
    $title = $title_nodes->item(0)->nodeValue;
    $title = trim($title);

    echo "| Title: " . $title . PHP_EOL;

    $stock_nodes = $xpath->query("//span[@class='state-instock']");
    $stock = $stock_nodes->item(0)->nodeValue;
    $stock = trim($stock);

    echo "| Old Stock: " . $old_stock . PHP_EOL;
    echo "| Stock: " . $stock . PHP_EOL;

    if ($old_stock == $stock) {
        echo "| -> No changed " . PHP_EOL;
        return;
    }

    file_put_contents("/data/targets/" . $item_id . ".txt", $stock);

    if ($old_stock == null) {
        echo "| -> First crawling " . PHP_EOL;
        return;
    }

    sendDiscordWebhook("`" . $title . "` の販売状況が `" . $stock . "` になりました。(前回: `" . $old_stock . "`)\nhttps://www.melonbooks.co.jp/detail/detail.php?product_id=" . $item_id . "&adult_view=1");
}

if (!file_exists("/data/config.json")){
    echo "/data/config.json not found" . PHP_EOL;
    exit(1);
}

$config = json_decode(file_get_contents("/data/config.json"), true);
$discordWebhookUrl = $config["discordWebhookUrl"];
$targets = $config["targets"];

foreach ($targets as $target) {
    echo "Crawling " . $target . PHP_EOL;
    crawler($target);
}
