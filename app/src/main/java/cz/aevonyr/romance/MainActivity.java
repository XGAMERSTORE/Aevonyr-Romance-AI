package cz.aevonyr.romance;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.provider.OpenableColumns;
import android.database.Cursor;
import com.google.mediapipe.tasks.genai.llminference.LlmInference;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final int PICK_MODEL = 4201;
    private WebView web;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private LlmInference inference;
    private volatile boolean generating = false;

    private File modelFile() { return new File(getFilesDir(), "romance-model.task"); }
    private void js(String name, String value) {
        runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("window."+name+"("+JSONObject.quote(value)+")", null);
        });
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(28,18,35));
        getWindow().setNavigationBarColor(Color.rgb(33,21,37));
        getWindow().getDecorView().setSystemUiVisibility(0);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        web = new WebView(this);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                }
                return false;
            }
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public void selectModel() {
                runOnUiThread(() -> {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.setType("*/*");
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(intent, PICK_MODEL);
                });
            }
            @JavascriptInterface public boolean hasModel() {
                return modelFile().isFile() && modelFile().length() > 0;
            }
            @JavascriptInterface public void generate(String prompt) {
                if (generating) { js("nativeModelError","Model právě odpovídá."); return; }
                if (!modelFile().isFile()) { js("nativeModelError","Nejdřív vyber kompatibilní .task model."); return; }
                generating=true;
                executor.execute(() -> {
                    try {
                        if (inference==null) {
                            LlmInference.LlmInferenceOptions options=LlmInference.LlmInferenceOptions.builder()
                                .setModelPath(modelFile().getAbsolutePath())
                                .setMaxTokens(1024)
                                .setTopK(40)
                                .setTemperature(0.8f)
                                .build();
                            inference=LlmInference.createFromOptions(MainActivity.this,options);
                        }
                        String result=inference.generateResponse(prompt);
                        js("nativeModelReply",result);
                    } catch(Exception ex) {
                        js("nativeModelError",ex.getMessage()==null?"Model nelze spustit na tomto telefonu.":ex.getMessage());
                    } finally { generating=false; }
                });
            }
        }, "LocalAI");
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode!=PICK_MODEL||resultCode!=RESULT_OK||data==null||data.getData()==null)return;
        Uri uri=data.getData();
        executor.execute(() -> {
            File tmp=new File(getFilesDir(),"romance-model.tmp");
            try {
                String name="";
                try(Cursor cursor=getContentResolver().query(uri,null,null,null,null)){
                    if(cursor!=null&&cursor.moveToFirst()){
                        int i=cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                        if(i>=0)name=cursor.getString(i);
                    }
                }
                if(!name.toLowerCase(java.util.Locale.ROOT).endsWith(".task"))throw new Exception("Vyber kompatibilní MediaPipe .task model.");
                try(InputStream in=getContentResolver().openInputStream(uri);FileOutputStream out=new FileOutputStream(tmp)){
                    if(in==null)throw new Exception("Nelze otevřít soubor modelu.");
                    byte[] buffer=new byte[1024*1024];int n;
                    while((n=in.read(buffer))!=-1)out.write(buffer,0,n);
                }
                if(tmp.length()<1024*1024)throw new Exception("Model je příliš malý nebo poškozený.");
                if(inference!=null){inference.close();inference=null;}
                File target=modelFile();
                if(target.exists()&&!target.delete())throw new Exception("Nelze přepsat starý model.");
                if(!tmp.renameTo(target))throw new Exception("Nelze uložit model.");
                js("nativeModelReady","Model byl uložen ("+(target.length()/1024/1024)+" MB).");
            }catch(Exception ex){
                js("nativeModelError",ex.getMessage()==null?"Import modelu selhal.":ex.getMessage());
            }finally{if(tmp.exists())tmp.delete();}
        });
    }
    @Override public void onBackPressed() {
        if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        executor.execute(()->{if(inference!=null){inference.close();inference=null;}});
        executor.shutdown();
        if(web!=null){web.destroy();web=null;}
        super.onDestroy();
    }
}
